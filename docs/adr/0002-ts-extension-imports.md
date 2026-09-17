# import 写 `.ts` 后缀，不写 `.js`

TypeScript 的 NodeNext 惯例是在 `.ts` 文件里 import `./impl.js`（指向编译产物）。但这让源码无法被 `node` 直接运行：Node 的类型剥离要求说明符匹配真实文件，于是每个项目都必须引入 tsx / vitest 之类的 loader，才能跑一个测试文件。

我们改用真实后缀 `./impl.ts`，靠 `allowImportingTsExtensions` + `rewriteRelativeImportExtensions` 让 TypeScript 在编译输出时把它改写成 `.js`。

## Considered Options

- **`.js` 后缀 + TS-aware 测试运行器**：更常见，但把"跑测试"绑到一个额外依赖上——而我们刻意不引入测试框架。
- **`.js` 后缀 + 只测编译产物**：多一个构建步骤，且测试跑的不是源码。
- **`.ts` 后缀 + 只 lint/typecheck、不运行**：放弃了裸 `node --test` 这个好处，等于没解决问题。

## Consequences

- 测试用 `node --test` 即可，零额外依赖；源码直接被 Node 运行，不需要构建步骤。
- 编译产物中的后缀由编译器改写，发布出去的包不受影响。
- 这是与主流惯例相反的选择：看到 `import "./x.ts"` 的人第一反应会是"这不对"。记在这里，免得下次被"修正"回去。
