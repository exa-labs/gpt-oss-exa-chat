/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "/gpt-oss-chat",
    experimental: {
      serverActions: {
        allowedOrigins: ["demo.exa.ai"],
        allowedForwardedHosts: ["demo.exa.ai"],
      },
    },
  };
  
export default nextConfig;
