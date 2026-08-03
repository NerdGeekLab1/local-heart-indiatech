import { Helmet } from "react-helmet-async";

/** Renders one or more schema.org JSON-LD blocks into the document head. */
const JsonLd = ({ data }: { data: unknown | unknown[] }) => {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <Helmet>
      {blocks.filter(Boolean).map((block, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(block)}</script>
      ))}
    </Helmet>
  );
};

export default JsonLd;
