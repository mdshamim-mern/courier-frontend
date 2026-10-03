import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig = {
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);