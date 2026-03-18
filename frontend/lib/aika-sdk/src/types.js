/**
 * @typedef {Object} AikaAppConfig
 * @property {string} key - Unique app identifier, e.g. 'aika-core'
 * @property {string} title - Display name
 * @property {{ en: string, hu?: string }} description - i18n descriptions
 * @property {string} [icon] - Emoji or URL
 * @property {string} [theme] - Card background theme: 'hacker' | 'space' | 'city' | 'racing' | 'life' | 'social' | CSS gradient
 * @property {'free' | 'pro' | 'vip'} [access_type] - Default: 'free'
 * @property {string} [version]
 * @property {string} [hubUrl] - Default: 'https://aikahub.com'
 * @property {string} [adminPanel] - Relative path to app's admin UI
 */

/**
 * @typedef {Object} AikaUser
 * @property {string} userId
 * @property {string} email
 * @property {string} nickname
 * @property {string} role
 * @property {string} tier
 * @property {number} exp - Token expiry timestamp
 */

export {};
