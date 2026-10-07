/** @type {import('next').NextConfig} */
// Serverless functions only ship files the tracer can prove are needed.
// Reference/swatch PNG paths are built at runtime, so they must be forced in —
// otherwise the provider sends zero images to the edits endpoint on Vercel.
// data/studies is deliberately excluded (local dev artifacts, gitignored).
const GENERATION_ASSETS = [
  "./data/colours/**/*",
  "./data/garments/**/*",
  "./public/garments/**/*",
  "./public/swatches/**/*",
];

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/studies": GENERATION_ASSETS,
    "/api/studies/[id]/regenerate": GENERATION_ASSETS,
    "/api/colours": ["./data/colours/**/*"],
    "/api/garments": ["./data/garments/**/*"],
    "/create": ["./data/garments/**/*"],
    "/create/colours": ["./data/colours/**/*", "./data/garments/**/*"],
  },
};

export default nextConfig;
