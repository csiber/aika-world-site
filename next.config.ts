import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.config.ts");

const nextConfig = {
  images: {unoptimized: true},
};

export default withNextIntl(nextConfig);
