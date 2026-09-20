import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root: this project lives inside the user's home
  // directory, and without this Turbopack walks up and warns about it.
  turbopack: {
    root: __dirname,
  },
  // The floating dev badge overlaps the sidebar footer during demos.
  devIndicators: false,
};

export default nextConfig;
