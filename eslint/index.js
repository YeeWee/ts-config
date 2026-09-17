import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * The shared rule set, as an ESLint flat-config array.
 *
 * The only project-specific input is `tsconfigRootDir` — type-aware rules need
 * to know where the project root is. Everything else is policy and lives here,
 * so a consuming project's config is one call with no copied rule lists.
 *
 * Type-aware rules are scoped to TS files on purpose: a `.js`/`.cjs` file that
 * is not part of any tsconfig would otherwise make projectService fail.
 *
 * @param {object} [options]
 * @param {string} [options.tsconfigRootDir] Absolute path to the consuming project root.
 * @returns {import("eslint").Linter.Config[]}
 */
export default function config({ tsconfigRootDir = process.cwd() } = {}) {
  return tseslint.config(
    { ignores: ["**/dist/**", "**/coverage/**", "**/node_modules/**"] },
    { languageOptions: { globals: { ...globals.node } } },
    js.configs.recommended,
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
      extends: [
        ...tseslint.configs.strictTypeChecked,
        ...tseslint.configs.stylisticTypeChecked,
      ],
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        // These four are the teeth of STANDARDS.md. They are asserted here
        // explicitly rather than left to the presets, so a preset change cannot
        // quietly turn them off. Everything else comes from strictTypeChecked.

        // §1 — 外部数据在边缘解析一次，内部签名里不该出现 any/unknown 泄漏
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-unsafe-assignment": "error",
        "@typescript-eslint/no-unsafe-argument": "error",
        "@typescript-eslint/no-unsafe-return": "error",

        // §2 — 导出的函数写显式返回类型：返回类型是公开契约
        "@typescript-eslint/explicit-module-boundary-types": "error",

        // §3 — 用字符串字面量联合 + as const 对象代替 enum
        "no-restricted-syntax": [
          "error",
          {
            selector: "TSEnumDeclaration",
            message:
              "用字符串字面量联合 + as const 对象代替 enum（STANDARDS.md §3）。",
          },
        ],

        // §4 — 不留悬空 promise
        "@typescript-eslint/no-floating-promises": [
          "error",
          {
            // node:test / vitest 用“调用一个函数”来声明测试，而那个函数返回
            // promise。把它判为悬空 promise 会让规则和标准测试写法对抗，
            // 从而逼出 `void test(...)` 这种为了消警告而写的噪音。
            allowForKnownSafeCalls: [
              {
                from: "package",
                package: "node:test",
                name: [
                  "test",
                  "it",
                  "describe",
                  "before",
                  "after",
                  "beforeEach",
                  "afterEach",
                ],
              },
              {
                from: "package",
                package: "vitest",
                name: [
                  "test",
                  "it",
                  "describe",
                  "beforeAll",
                  "afterAll",
                  "beforeEach",
                  "afterEach",
                ],
              },
            ],
          },
        ],
        "@typescript-eslint/no-misused-promises": "error",
      },
    },
  );
}
