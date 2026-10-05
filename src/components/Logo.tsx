export default function Logo({ height = 20 }: { height?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/LatexLabs_primary_OUTLINED.svg"
      alt="LatexLabs"
      style={{ height, display: "block" }}
    />
  );
}
