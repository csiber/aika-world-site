import fs from "node:fs";
import path from "node:path";
import type {NextConfig} from "next";

type NextIntlPluginInput =
  | string
  | {
      requestConfig?: string;
    };

function createLocalNextIntlPlugin(
  input: NextIntlPluginInput = {}
): (config?: NextConfig) => NextConfig {
  const pluginConfig =
    typeof input === "string" ? {requestConfig: input} : input ?? {};

  const requestConfig = pluginConfig.requestConfig ?? "./i18n.config.ts";
  const absoluteRequestConfig = path.resolve(process.cwd(), requestConfig);

  if (!fs.existsSync(absoluteRequestConfig)) {
    throw new Error(
      `[next-intl] Could not find the i18n configuration file at "${requestConfig}".`
    );
  }

  return function withNextIntl(nextConfig: NextConfig = {}): NextConfig {
    if (nextConfig.i18n) {
      console.warn(
        "[next-intl] Az `i18n` beállítás ütközhet az App Routerrel, ezért érdemes eltávolítani."
      );
    }

    const originalWebpack = nextConfig.webpack;

    const shouldExtendExperimentalTurbo =
      typeof nextConfig.experimental?.turbo !== "undefined";

    const mergedConfig: NextConfig = {
      ...nextConfig,
      webpack(config, options) {
        config.resolve ??= {};
        config.resolve.alias ??= {};
        config.resolve.alias["next-intl/config"] = absoluteRequestConfig;

        if (typeof originalWebpack === "function") {
          const result = originalWebpack(config, options);
          return result ?? config;
        }

        return config;
      },
      experimental: shouldExtendExperimentalTurbo
        ? {
            ...nextConfig.experimental,
            turbo: {
              ...nextConfig.experimental?.turbo,
              resolveAlias: {
                ...nextConfig.experimental?.turbo?.resolveAlias,
                "next-intl/config": requestConfig,
              },
            },
          }
        : nextConfig.experimental,
      turbopack: {
        ...nextConfig.turbopack,
        resolveAlias: {
          ...nextConfig.turbopack?.resolveAlias,
          "next-intl/config": requestConfig,
        },
      },
    };

    if (nextConfig.trailingSlash) {
      mergedConfig.env = {
        ...nextConfig.env,
        _next_intl_trailing_slash: "true",
      };
    }

    return mergedConfig;
  };
}

const withNextIntl = createLocalNextIntlPlugin("./i18n.config.ts");

const nextConfig: NextConfig = {
  images: {unoptimized: true},
};

export default withNextIntl(nextConfig);
