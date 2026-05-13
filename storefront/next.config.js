const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      ...(process.env.NEXT_PUBLIC_BASE_URL
        ? [{ // Note: needed to serve images from /public folder
            protocol: process.env.NEXT_PUBLIC_BASE_URL.startsWith("https") ? "https" : "http",
            hostname: process.env.NEXT_PUBLIC_BASE_URL.replace(/^https?:\/\//, ""),
          }]
        : []),
      ...(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        ? [{ // Note: only needed when using local-file for product media
            protocol: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.startsWith("https") ? "https" : "http",
            hostname: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/^https?:\/\//, ""),
          }]
        : []),
      { // Note: can be removed after deleting demo products
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      { // Note: can be removed after deleting demo products
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      { // Note: can be removed after deleting demo products
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      ...(process.env.NEXT_PUBLIC_R2_PUBLIC_URL ? [{
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_R2_PUBLIC_URL.replace(/^https?:\/\//, ""),
      }] : []),
    ],
  },
  serverRuntimeConfig: {
    port: process.env.PORT || 3000
  }
}

module.exports = nextConfig
