/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: false,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Ignore type errors during builds to ensure they do not block the build
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
