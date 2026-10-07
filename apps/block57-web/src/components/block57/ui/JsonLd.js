/**
 * Structured data script. `data` is a schema.org object (see
 * `buildApartmentComplexJsonLd` in `@/lib/block57/seo`). "<" is escaped so
 * the payload can never close the script element.
 */
export default function JsonLd({ data }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
