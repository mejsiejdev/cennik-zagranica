/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/pl",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
