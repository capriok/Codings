import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Ensure the Next app treats this folder as the root, avoiding
    // the workspace bun.lockb warning and selecting the correct lockfile.
    root: __dirname,
  },
}

export default nextConfig
