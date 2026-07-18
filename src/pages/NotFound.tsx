import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Compass } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log as info — not an error — so it doesn't pollute Sentry / console.error dashboards.
    console.info("[404]", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Helmet>
        <title>Page not found · Travelista</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Compass className="w-8 h-8 text-primary" />
        </div>
        <h1 className="mb-2 text-5xl font-bold">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          We couldn't find <code className="text-sm bg-background px-1.5 py-0.5 rounded">{location.pathname}</code>. It may have moved or never existed.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
