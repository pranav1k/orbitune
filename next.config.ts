import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images:{
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.saavncdn.com",
      },
      {
        protocol: "https",
        hostname: "*.jiosaavn.com",
      },
    ],
  }
};

export default withSerwist(nextConfig);
