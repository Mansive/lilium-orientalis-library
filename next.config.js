/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.1lib.sk",
        port: "",
        pathname: "/covers/books/**",
      },
    ],
  },
};

module.exports = nextConfig;
