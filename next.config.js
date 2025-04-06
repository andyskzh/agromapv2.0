/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.redd.it",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
    ],
    domains: ["res.cloudinary.com"],
  },
};

module.exports = nextConfig;
