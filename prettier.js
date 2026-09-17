/**
 * Shared Prettier config.
 *
 * Consume it by making the project's `.prettierrc` a single string:
 *
 *   "@yeewee/ts-config/prettier"
 *
 * These are the values the old per-repo setup used, kept verbatim so adopting
 * the shared config does not silently reformat anyone's code.
 */
export default {
  useTabs: false,
  tabWidth: 2,
  printWidth: 80,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  arrowParens: "always",
};
