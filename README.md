# @yeewee/ts-config

个人项目共用的 TypeScript 配置：严格的 `tsconfig`、type-aware ESLint、Prettier，以及深模块的模块边界规则。

**唯一真相就在这里。** 项目里不再有配置副本，只有几行引用。

## 项目怎么接（4 个文件，全是薄的）

```bash
pnpm add -D github:YeeWee/ts-config
```

```jsonc
// tsconfig.json
{
  "extends": "@yeewee/ts-config/tsconfig.base.json",
  // TypeScript 6.0 起 `types` 默认为 []，@types 不再自动包含。
  // Node 项目必须显式写这一行；前端项目不需要。
  "compilerOptions": { "types": ["node"] },
  "include": ["src"]
}
```

```jsonc
// package.json
{ "prettier": "@yeewee/ts-config/prettier" }
```

```js
// eslint.config.js
import config from "@yeewee/ts-config/eslint";
export default config({ tsconfigRootDir: import.meta.dirname });
```

```js
// .dependency-cruiser.cjs
module.exports = require("@yeewee/ts-config/dependency-cruiser")("src/packages");
```

加一个 `.prettierignore`（锁文件是 pnpm 生成的，prettier 不该碰它，否则每次 `install` 后 `format:check` 都会挂）：

```
pnpm-lock.yaml
```

工具本身（`typescript`、`eslint`、`prettier`、`dependency-cruiser`）仍是项目自己的 devDependencies——项目要运行这些二进制。ESLint 的插件与 parser 由本包携带，项目不需要单独安装。

**import 写真实后缀：`import { x } from "./impl.ts"`。** 编译时改写成 `.js`，源码因此能被 `node` 直接运行，跑测试不需要 loader。理由见 `docs/adr/0002`。

## 包里有什么

| 导出 | 是什么 |
| --- | --- |
| `./tsconfig.base.json` | 严格性 + 模块语义。**只管策略**，不管布局（`include`/`outDir`/`noEmit` 留在项目里） |
| `./prettier` | 格式默认值 |
| `./eslint` | flat config 函数，唯一参数是 `tsconfigRootDir` |
| `./dependency-cruiser` | 边界规则函数，唯一参数是 packages root |
| `STANDARDS.md` | 工具检查不到的判断类规则。**配置是机械层，这份是判断层** |

两个配置导出的是**函数而不是对象**：项目之间唯一真正不同的东西（tsconfig 在哪、packages 在哪）是参数，所以副本里没有需要手改的常量。

## 模块边界规则

每个 package 是一个**深模块**：根文件是它的**入口点**（公开），子目录里的东西是私有的。

```
src/packages/<name>/
  index.ts        ← 入口点，外部只能 import 这里
  client.ts       ← 可以有很多个入口点，好过一个巨型 barrel
  lib/            ← 实现，外部不可见，包内部自由互相 import
  tests/          ← 测试与 fixture，同样是私有的
```

四条规则，全部为 `error`：外部代码只能走入口点；包内部自由；测试也必须走入口点；`tests/` 只能被测试引用。另有禁止循环依赖。

分层（哪个包可以依赖哪个包）是另一件事，在配置里留了注释掉的占位。

## 开发这套配置

```bash
pnpm install
pnpm -F ts-config-example check
```

`example/` 是一个真实的消费者，配置改完先在它上面验证，再推送。它的存在是为了让编辑回路不必拿真实项目当试验田。

## 已知约束

- **TypeScript 钉在 6.0.x（`~6.0.3`）。** `typescript-eslint` 8.70 的 peer 范围是 `typescript >=4.8.4 <6.1.0`，**不支持 TypeScript 7**（Go 重写版）。所以在它支持之前，把 TS 升到 7 会让 type-aware linting 直接失效。这条是环境不会告诉你的 gotcha，别“顺手”把版本号提上去。
- **`types: ["node"]` 要写在项目里，不写在基座里。** TypeScript 6.0 把 `types` 的默认值改成了 `[]`，**移除了 `node_modules/@types` 的自动包含**。所以装了 `@types/node` 也不会生效，症状是一个指向模块说明符的 `TS2591 Cannot find name 'node:assert/strict'`——很容易误诊成“类型没装”。基座不写它，因为写死会让任何没装 `@types/node` 的项目硬报错，而“需要哪些全局类型包”本就是项目的事。
- **会 emit 的项目必须自己写 `rootDir`。** TypeScript 6.0 新增 `TS5011`：当共同源码目录不是 tsconfig 所在目录时，必须显式声明 `rootDir`，否则报错。这也是基座刻意不管布局（`rootDir`/`outDir`/`noEmit`）的原因——它属于项目。

## 版本策略

配置成型期项目跟默认分支（`github:YeeWee/ts-config`），改一处全项目生效。等配置一周没改过，切 tag 引用（`#v1.0.0`），把"生效"变成一次显式升级。见 `docs/adr/0001-git-dependency.md`。
