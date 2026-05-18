import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ai-support-hub/shared"],
  // Allow using logical properties in Tailwind without issues
  experimental: {
    optimizePackageImports: ['lucide-react'],
  }
};

export default withNextIntl(nextConfig);
