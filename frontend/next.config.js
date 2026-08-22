/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'logo.clearbit.com' },
            { protocol: 'https', hostname: '*.clearbit.com' },
            { protocol: 'https', hostname: 'm.media-amazon.com' },
            { protocol: 'https', hostname: '*.amazon.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'www.google.com' },
            { protocol: 'https', hostname: '*.google.com' },
        ],
    },
};

module.exports = nextConfig;
