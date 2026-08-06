import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BookingsPanel, { type BookingRow } from "@/components/admin/BookingsPanel";

const row = (i: number): BookingRow => ({
  id: `id-${i}`,
  ref: `#booking${i}`,
  host: "Ravi S.",
  traveler: "Anna B.",
  dates: "2026-01-01 → 2026-01-05",
  guests: 2,
  total: 5000,
  status: "pending",
});

const baseProps = {
  page: 0,
  pageSize: 10,
  onPage: vi.fn(),
  onPageSize: vi.fn(),
  formatCurrency: (n: number) => `₹${n}`,
  onStatusChange: vi.fn(),
  onRefresh: vi.fn(),
};

describe("Admin bookings dashboard states", () => {
  it("shows skeletons while loading with no rows", () => {
    render(<BookingsPanel {...baseProps} rows={[]} loading />);
    expect(screen.getByTestId("bookings-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("bookings-empty")).toBeNull();
    expect(screen.queryByTestId("bookings-table")).toBeNull();
  });

  it("shows the empty state when the bookings table has no rows", () => {
    render(<BookingsPanel {...baseProps} rows={[]} loading={false} />);
    expect(screen.getByTestId("bookings-empty")).toBeInTheDocument();
    expect(screen.getByText("No bookings yet")).toBeInTheDocument();
    expect(screen.queryByTestId("bookings-table")).toBeNull();
  });

  it("renders a populated table with rows, totals and status controls", () => {
    render(<BookingsPanel {...baseProps} rows={[row(1), row(2), row(3)]} loading={false} />);
    expect(screen.getByTestId("bookings-table")).toBeInTheDocument();
    expect(screen.getAllByTestId("booking-row")).toHaveLength(3);
    expect(screen.getByText("#booking1")).toBeInTheDocument();
    expect(screen.getAllByText("₹5000")).toHaveLength(3);
    expect(screen.getAllByRole("combobox", { name: /Status for/ })).toHaveLength(3);
    expect(screen.queryByTestId("bookings-empty")).toBeNull();
  });

  it("paginates and reports totals when rows exceed the page size", () => {
    const rows = Array.from({ length: 12 }, (_, i) => row(i));
    render(<BookingsPanel {...baseProps} rows={rows} loading={false} />);
    expect(screen.getAllByTestId("booking-row")).toHaveLength(10);
    expect(screen.getByText("1–10")).toBeInTheDocument();
    expect(screen.getByLabelText("Rows per page")).toBeInTheDocument();
  });

  it("keeps showing cached rows during a background refresh", () => {
    render(<BookingsPanel {...baseProps} rows={[row(1)]} loading />);
    expect(screen.getByTestId("bookings-table")).toBeInTheDocument();
    expect(screen.queryByTestId("bookings-loading")).toBeNull();
  });
});
