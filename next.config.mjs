/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // WalletConnect pulls in pino-pretty (optional dev dep) and viem's dynamic
    // require — neither is needed in the browser. Stub them out to silence warnings.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
      encoding: false,
    };
    return config;
  },
};

export default nextConfig;
