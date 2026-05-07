import path from "path"

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  output: "standalone",

  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve("./")
    return config
  },
}

export default nextConfig