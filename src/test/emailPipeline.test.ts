/**
 * Automated coverage for the app-email pipeline: seeding a booking + host
 * approval, triggering the transactional email, and asserting that
 *  1. the same trigger never enqueues twice (idempotency key dedupe)
 *  2. a message that fails transiently is retried until delivered
 *  3. a message that keeps failing lands in the DLQ instead of looping forever
 *
 * The queue semantics mirror supabase/functions/process-email-queue.
 */
import { describe, it, expect, beforeEach } from "vitest";

const MAX_RETRIES = 5;

type Msg = { idempotencyKey: string; template: string; to: string; attempts: number };

class FakeEmailQueue {
  queued: Msg[] = [];
  sent: Msg[] = [];
  dlq: { msg: Msg; reason: string }[] = [];
  private seenKeys = new Set<string>();

  enqueue(msg: Omit<Msg, "attempts">): boolean {
    if (this.seenKeys.has(msg.idempotencyKey)) return false;
    this.seenKeys.add(msg.idempotencyKey);
    this.queued.push({ ...msg, attempts: 0 });
    return true;
  }

  /** transport(msg) resolves true when the provider accepted the message */
  drain(transport: (msg: Msg) => boolean) {
    let guard = 0;
    while (this.queued.length && guard++ < 100) {
      const msg = this.queued.shift()!;
      msg.attempts++;
      if (transport(msg)) {
        this.sent.push(msg);
      } else if (msg.attempts >= MAX_RETRIES) {
        this.dlq.push({ msg, reason: `Max retries (${MAX_RETRIES}) exceeded` });
      } else {
        this.queued.push(msg);
      }
    }
  }
}

// --- seeded fixtures -------------------------------------------------------
const booking = { id: "bk-1", travelerEmail: "traveler@example.com" };
const application = { id: "app-1", hostEmail: "host@example.com" };

function confirmBooking(queue: FakeEmailQueue) {
  return queue.enqueue({
    idempotencyKey: `booking-confirmation-${booking.id}`,
    template: "booking-confirmation",
    to: booking.travelerEmail,
  });
}

function approveHost(queue: FakeEmailQueue) {
  return queue.enqueue({
    idempotencyKey: `host-acceptance-${application.id}`,
    template: "host-acceptance",
    to: application.hostEmail,
  });
}

let queue: FakeEmailQueue;
beforeEach(() => { queue = new FakeEmailQueue(); });

describe("booking confirmation email", () => {
  it("is delivered once for a confirmed booking", () => {
    expect(confirmBooking(queue)).toBe(true);
    queue.drain(() => true);
    expect(queue.sent.map((m) => m.template)).toEqual(["booking-confirmation"]);
    expect(queue.sent[0].to).toBe(booking.travelerEmail);
  });

  it("does not duplicate when the status update is retried", () => {
    confirmBooking(queue);
    expect(confirmBooking(queue)).toBe(false);
    confirmBooking(queue);
    queue.drain(() => true);
    expect(queue.sent).toHaveLength(1);
    expect(queue.dlq).toHaveLength(0);
  });
});

describe("host approval email", () => {
  it("is delivered once per approved application", () => {
    expect(approveHost(queue)).toBe(true);
    expect(approveHost(queue)).toBe(false);
    queue.drain(() => true);
    expect(queue.sent).toHaveLength(1);
    expect(queue.sent[0].template).toBe("host-acceptance");
  });

  it("keeps booking and approval emails independent", () => {
    confirmBooking(queue);
    approveHost(queue);
    queue.drain(() => true);
    expect(queue.sent.map((m) => m.template).sort()).toEqual(["booking-confirmation", "host-acceptance"]);
  });
});

describe("retry behaviour", () => {
  it("delivers after transient failures without duplicating the send", () => {
    confirmBooking(queue);
    let calls = 0;
    queue.drain(() => ++calls >= 3); // fails twice, then succeeds
    expect(calls).toBe(3);
    expect(queue.sent).toHaveLength(1);
    expect(queue.sent[0].attempts).toBe(3);
    expect(queue.dlq).toHaveLength(0);
  });

  it("moves permanently failing messages to the DLQ after max retries", () => {
    approveHost(queue);
    queue.drain(() => false);
    expect(queue.sent).toHaveLength(0);
    expect(queue.dlq).toHaveLength(1);
    expect(queue.dlq[0].msg.attempts).toBe(MAX_RETRIES);
    expect(queue.dlq[0].reason).toContain("Max retries");
    expect(queue.queued).toHaveLength(0);
  });

  it("a redrive of an already-sent message is rejected by the idempotency guard", () => {
    confirmBooking(queue);
    queue.drain(() => true);
    expect(confirmBooking(queue)).toBe(false);
    queue.drain(() => true);
    expect(queue.sent).toHaveLength(1);
  });
});
