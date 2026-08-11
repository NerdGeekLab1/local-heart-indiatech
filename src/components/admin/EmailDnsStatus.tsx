import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, ShieldAlert, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const SENDER_DOMAIN = "notify.roamyoo.com";
const EXPECTED_NS = ["ns3.lovable.cloud", "ns4.lovable.cloud"];

type Check = {
  label: string;
  hint: string;
  expected: string[];
  found: string[];
  ok: boolean;
};

async function resolve(name: string, type: "NS" | "TXT" | "MX"): Promise<string[]> {
  const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`);
  if (!res.ok) throw new Error(`DNS lookup failed (${res.status})`);
  const json = await res.json();
  return (json.Answer ?? [])
    .map((a: { data?: string }) => (a.data ?? "").replace(/^"|"$/g, "").replace(/\.$/, "").toLowerCase())
    .filter(Boolean);
}

const EmailDnsStatus = () => {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ns, mx, dkim] = await Promise.all([
        resolve(SENDER_DOMAIN, "NS"),
        resolve(SENDER_DOMAIN, "MX"),
        resolve(`_domainkey.${SENDER_DOMAIN}`, "TXT").catch(() => []),
      ]);

      setChecks([
        {
          label: "Nameserver delegation",
          hint: `NS records on ${SENDER_DOMAIN} must point to Lovable`,
          expected: EXPECTED_NS,
          found: ns,
          ok: EXPECTED_NS.every((expected) => ns.some((value) => value.includes(expected))),
        },
        {
          label: "Mail routing (MX)",
          hint: "Published once delegation has propagated",
          expected: ["mailgun.org"],
          found: mx,
          ok: mx.length > 0,
        },
        {
          label: "DKIM signing",
          hint: "Signing key served from the delegated zone",
          expected: ["dkim record"],
          found: dkim,
          ok: dkim.length > 0,
        },
      ]);
      setCheckedAt(new Date());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { run(); }, [run]);

  const allOk = checks.length > 0 && checks.every((c) => c.ok);

  return (
    <div className="rounded-lg bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <div>
            <p className="font-semibold text-foreground">Sender domain propagation</p>
            <p className="text-xs text-muted-foreground">
              {SENDER_DOMAIN}
              {checkedAt && ` · checked ${checkedAt.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={run} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Re-check DNS
        </Button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-destructive">Could not query DNS: {error}</p>
      ) : (
        <>
          <ul className="mt-4 space-y-3">
            {checks.map((check) => (
              <li key={check.label} className="flex items-start gap-3 rounded-md border border-border p-3">
                {check.ok ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                ) : (
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{check.label}</p>
                  <p className="text-xs text-muted-foreground">{check.hint}</p>
                  <p className="mt-1 break-words text-xs text-muted-foreground">
                    Expected: {check.expected.join(", ")}
                  </p>
                  <p className="break-words text-xs text-muted-foreground">
                    Found: {check.found.length ? check.found.join(", ") : "— nothing yet"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {checks.length > 0 && (
            <p className={`mt-3 text-sm font-medium ${allOk ? "text-accent" : "text-muted-foreground"}`}>
              {allOk
                ? "Propagation complete — queued emails can be retested."
                : "Still propagating. Add the NS records at your DNS provider, then re-check (can take up to 72 hours)."}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default EmailDnsStatus;
