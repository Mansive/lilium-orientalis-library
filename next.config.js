/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          { key: "Access-Control-Allow-Methods", value: "GET" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "archive.org",
        port: "",
        pathname: "/download/**",
      },
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        port: "",
        pathname: "/b/id/**",
      },
      {
        protocol: "https",
        hostname: "images.isbndb.com",
        port: "",
        pathname: "/covers/**",
      },
      {
        protocol: "https",
        hostname: "libgen.li",
        port: "",
        pathname: "/comicscovers/**",
      },
      {
        protocol: "https",
        hostname: "libgen.li",
        port: "",
        pathname: "/comicscovers_repository/**",
      },
      {
        protocol: "https",
        hostname: "libgen.li",
        port: "",
        pathname: "/covers/**",
      },
      {
        protocol: "https",
        hostname: "libgen.li",
        port: "",
        pathname: "/editioncovers/**",
      },
      {
        protocol: "https",
        hostname: "libgen.li",
        port: "",
        pathname: "/fictioncovers/**",
      },
      {
        protocol: "https",
        hostname: "libgen.li",
        port: "",
        pathname: "/fictionruscovers/**",
      },
      {
        protocol: "https",
        hostname: "libgen.li",
        port: "",
        pathname: "/magzcovers/**",
      },
      {
        protocol: "https",
        hostname: "libgen.rs",
        port: "",
        pathname: "/covers/**",
      },
      {
        protocol: "https",
        hostname: "libgen.rs",
        port: "",
        pathname: "/fictioncovers/**",
      },
      {
        protocol: "https",
        hostname: "reader.zlibcdn.com",
        port: "",
        pathname: "/books/**",
      },
      {
        protocol: "https",
        hostname: "static.1lib.sk",
        port: "",
        pathname: "/covers/books/**",
      },
      {
        protocol: "https",
        hostname: "static.3lib.net",
        port: "",
        pathname: "/covers/books/**",
      },
    ],
  },
};

module.exports = nextConfig;
