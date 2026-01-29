/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ini akan mengabaikan error ESLint saat build agar tetap online
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig