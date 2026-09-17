import config from "@yeewee/ts-config/eslint";

// `tsconfigRootDir` is the one thing type-aware linting cannot infer, so it is
// passed explicitly instead of relying on the cwd the linter happens to run in.
export default config({ tsconfigRootDir: import.meta.dirname });
