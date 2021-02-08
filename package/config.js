const { resolve, join } = require('path')
const { safeLoad } = require('js-yaml')
const { readFileSync } = require('fs')
const { isArray, ensureTrailingSlash, replacePlaceholders } = require('./utils/helpers')
const { merge } = require('webpack-merge')
const { railsEnv } = require('./env')
const configPath = require('./configPath')

const defaultConfigPath = require.resolve(process.env.WEBPACKER_DEFAULT_CONFIG || '../lib/install/config/webpacker.yml')

const getDefaultConfig = () => {
  const defaultConfig = safeLoad(readFileSync(defaultConfigPath), 'utf8')
  return defaultConfig[railsEnv] || defaultConfig.production
}

const defaults = getDefaultConfig()
const app = safeLoad(readFileSync(configPath), 'utf8')[railsEnv]

if (isArray(app.extensions) && app.extensions.length) delete defaults.extensions
if (isArray(app.static_assets_extensions) && app.static_assets_extensions.length) {
  delete defaults.static_assets_extensions
}

const config = merge(defaults, app)

config.outputPath = resolve(replacePlaceholders(join(config.public_root_path, config.public_output_path), process.env));

// Merge resolved_paths into additional_paths for backwards-compat
config.additional_paths = config.additional_paths.concat(config.resolved_paths || []);


config.outputPath = resolve(config.public_root_path, config.public_output_path)

// Ensure that the publicPath includes our asset host so dynamic imports
// (code-splitting chunks and static assets) load from the CDN instead of a relative path.
const getPublicPath = () => {
  const rootUrl = ensureTrailingSlash(process.env.WEBPACKER_ASSET_HOST || '/')
  return `${rootUrl}${config.public_output_path}/`
}

config.publicPath = getPublicPath()
config.publicPathWithoutCDN = `/${config.public_output_path}/`

const deepReplacePlaceholders = (config) => {
  Object.keys(config).forEach((key) => {
    if (typeof config[key] === 'string') {
      config[key] = replacePlaceholders(config[key], process.env);
    } else if (typeof config[key] === 'object') {
      config[key] = deepReplacePlaceholders(config[key]);
    }
  });

  return config;
};

deepReplacePlaceholders(config);

module.exports = config
