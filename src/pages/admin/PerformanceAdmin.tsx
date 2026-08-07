import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Gauge, Package, Database } from "lucide-react";

interface RouteTiming {
  name: string;
  loadMs: number;
  transferKb: number;
  type: string;
}

interface QueryStat {
  key: string;
  state: string;
  dataUpdatedAt: number;
  fetchStatus: string;
  observers: number;
}

const PerformanceAdmin = () => {
  const qc = useQueryClient();
  const [nav, setNav] = useState<PerformanceNavigationTiming | null>(null);
  const [resources, setResources] = useState<RouteTiming[]>([]);
  const [queries, setQueries] = useState<QueryStat[]>([]);

  useEffect(() => {
    const collect = () => {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (navEntry) setNav(navEntry);

      const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const mapped: RouteTiming[] = res
        .filter((r) => /\.(js|css|woff2?|png|jpg|webp|svg)$/i.test(r.name) || r.initiatorType === "fetch")
        .map((r) => ({
          name: r.name.split("/").slice(-2).join("/"),
          loadMs: Math.round(r.responseEnd - r.startTime),
          transferKb: Math.round(((r as any).transferSize || 0) / 1024),
          type: r.initiatorType,
        }))
        .sort((a, b) => b.loadMs - a.loadMs)
        .slice(0, 30);
      setResources(mapped);

      const cache = qc.getQueryCache().getAll();
      setQueries(
        cache.map((q) => ({
          key: JSON.stringify(q.queryKey).slice(0, 80),
          state: q.state.status,
          dataUpdatedAt: q.state.dataUpdatedAt,
          fetchStatus: q.state.fetchStatus,
          observers: q.getObserversCount(),
        })),
      );
    };
    collect();
    const id = setInterval(collect, 3000);
    return () => clearInterval(id);
  }, [qc]);

  const totals = useMemo(() => {
    const totalKb = resources.reduce((s, r) => s + r.transferKb, 0);
    const slow = resources.filter((r) => r.loadMs > 500);
    return { totalKb, slowCount: slow.length };
  }, [resources]);

  const tti = nav ? Math.round(nav.domInteractive) : 0;
  const load = nav ? Math.round(nav.loadEventEnd) : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gauge className="w-7 h-7 text-primary" /> Performance Profiler
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live client-side metrics: route timings, bundle sizes, and cached queries.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">DOM Interactive</div>
          <div className="text-2xl font-bold">{tti}ms</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Load Event</div>
          <div className="text-2xl font-bold">{load}ms</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Bundle Transferred</div>
          <div className="text-2xl font-bold">{totals.totalKb}KB</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Slow Resources (&gt;500ms)</div>
          <div className="text-2xl font-bold">{totals.slowCount}</div>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <Package className="w-4 h-4" /> Slowest Resources
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="text-left py-2">Resource</th>
                <th className="text-right">Type</th>
                <th className="text-right">Load (ms)</th>
                <th className="text-right">Size (KB)</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-1.5 truncate max-w-[400px]">{r.name}</td>
                  <td className="text-right">{r.type}</td>
                  <td className="text-right">
                    {r.loadMs > 500 ? (
                      <Badge variant="destructive">{r.loadMs}</Badge>
                    ) : (
                      r.loadMs
                    )}
                  </td>
                  <td className="text-right">{r.transferKb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold flex items-center gap-2 mb-3">
          <Database className="w-4 h-4" /> React Query Cache ({queries.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="text-left py-2">Key</th>
                <th className="text-right">State</th>
                <th className="text-right">Fetch</th>
                <th className="text-right">Observers</th>
                <th className="text-right">Age (s)</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-1.5 font-mono truncate max-w-[380px]">{q.key}</td>
                  <td className="text-right">{q.state}</td>
                  <td className="text-right">{q.fetchStatus}</td>
                  <td className="text-right">{q.observers}</td>
                  <td className="text-right">
                    {q.dataUpdatedAt ? Math.round((Date.now() - q.dataUpdatedAt) / 1000) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 bg-muted/40">
        <h2 className="font-semibold flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4" /> Tips
        </h2>
        <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-1">
          <li>Any resource &gt; 500ms is a candidate for lazy-loading or CDN caching.</li>
          <li>Queries with 0 observers can be garbage-collected sooner via <code>gcTime</code>.</li>
          <li>Images should be uploaded through <code>ImageUpload</code> so they are compressed to WebP.</li>
        </ul>
      </Card>
    </div>
  );
};

export default PerformanceAdmin;
