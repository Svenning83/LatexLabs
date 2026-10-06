export default function Logo({ height = 40 }: { height?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/LatexLabs_primary_OUTLINED.svg"
      alt="LatexLabs"
      style={{ height, display: "block" }}
    />
  );
}
