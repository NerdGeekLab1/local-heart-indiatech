import { useEffect, useState } from "react";
import { MapPin, Navigation, LocateFixed, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Point { lat: number; lng: number }

/**
 * Meeting / pickup map preview for the booking + checkout flow.
 * Geocodes the host's city once via OpenStreetMap and, when the traveler shares
 * their location, draws the route link between the two points.
 */
export default function BookingMapPreview({ city, hostName }: { city: string; hostName: string }) {
  const [meetPoint, setMeetPoint] = useState<Point | null>(null);
  const [travelerPoint, setTravelerPoint] = useState<Point | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) return;
    let active = true;
    const query = encodeURIComponent(city.replace(/\s*\(.*\)$/, ""));
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`)
      .then(res => res.json())
      .then((rows: any[]) => {
        if (!active) return;
        const first = rows?.[0];
        if (first) setMeetPoint({ lat: Number(first.lat), lng: Number(first.lon) });
        else setError("We couldn't pin this city yet.");
      })
      .catch(() => active && setError("Map preview is unavailable right now."));
    return () => { active = false; };
  }, [city]);

  const shareLocation = () => {
    if (!navigator.geolocation) { setError("Your browser can't share a location."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setTravelerPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => { setError("Location permission denied — the meeting point is still shown."); setLocating(false); },
    );
  };

  const pad = 0.08;
  const points = [meetPoint, travelerPoint].filter(Boolean) as Point[];
  const bbox = points.length
    ? [
        Math.min(...points.map(p => p.lng)) - pad,
        Math.min(...points.map(p => p.lat)) - pad,
        Math.max(...points.map(p => p.lng)) + pad,
        Math.max(...points.map(p => p.lat)) + pad,
      ].join(",")
    : null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card" data-testid="booking-map-preview">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground"><MapPin className="h-4 w-4 text-primary" /> Meeting & pickup point</h3>
          <p className="text-xs text-muted-foreground">{city ? `${hostName} meets you in ${city}. Exact address is shared after confirmation.` : "Add a city to preview the pickup point."}</p>
        </div>
        <Button size="sm" variant="outline" className="shrink-0 rounded-full gap-1 text-xs" onClick={shareLocation} disabled={locating}>
          <LocateFixed className="h-3.5 w-3.5" /> {locating ? "Locating…" : travelerPoint ? "Update my spot" : "Show my route"}
        </Button>
      </div>

      <div className="mt-3 h-52 overflow-hidden rounded-xl border border-border bg-secondary/40">
        {bbox && meetPoint ? (
          <iframe
            title={`Pickup map for ${city}`}
            width="100%"
            height="100%"
            loading="lazy"
            style={{ border: 0 }}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${meetPoint.lat},${meetPoint.lng}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{error || "Loading map…"}</div>
        )}
      </div>

      {error && meetPoint && <p className="mt-2 text-[11px] text-muted-foreground">{error}</p>}

      {meetPoint && (
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-medium text-foreground hover:border-primary"
            target="_blank" rel="noreferrer"
            href={`https://www.openstreetmap.org/?mlat=${meetPoint.lat}&mlon=${meetPoint.lng}#map=12/${meetPoint.lat}/${meetPoint.lng}`}
          >
            <ExternalLink className="h-3 w-3" /> Open meeting point
          </a>
          {travelerPoint && (
            <a
              className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
              target="_blank" rel="noreferrer"
              href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${travelerPoint.lat}%2C${travelerPoint.lng}%3B${meetPoint.lat}%2C${meetPoint.lng}`}
            >
              <Navigation className="h-3 w-3" /> My route to the host
            </a>
          )}
        </div>
      )}
    </section>
  );
}
