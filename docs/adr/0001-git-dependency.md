# 共享 TS 配置走 git dependency，而不是发布 npm 包或逐仓库拷贝

多个项目需要同一套 tsconfig / ESLint / Prettier / 模块边界规则，而这套规则会持续演进。我们让 `YeeWee/ts-config` 成为唯一真相，各项目用 `pnpm add -D github:YeeWee/ts-config` 引用它。

代价是必须先把共享仓库推上去才能被消费，收益是**不存在副本**：改一处规则，所有项目升级后一起生效，不需要手动同步 N 份配置文件。

## Considered Options

- **逐仓库拷贝**（由 skill 把配置文件写进每个项目）：最省事，但副本必然漂移——配置的演进和项目的使用脱钩，且"哪个副本是新的"没有答案。这正是本决策要消灭的状态。
- **发布到 npm**：能得到真正的版本管理，但要维护发布流程和 registry 凭据；对个人配置来说，代价明显高于收益。git dependency 已经提供了版本能力（tag / commit），只是借用 GitHub 而不是 npm registry。
- **pnpm workspace / monorepo**：会让所有项目耦合进同一个仓库与同一个发布单元，与"每个项目独立成仓"的现状冲突。

## Consequences

- 仓库设为 **public**：`pnpm add` 无需任何鉴权，换机器、CI、容器里都不会因为凭据失败。
- 编辑回路天然慢（必须 push 才能被消费），因此本仓库自带 `example/` 作为真实消费者，配置先在 `example` 里验证再推送。
- 引用方式有两个阶段：配置成型期跟分支（改一处全项目生效），稳定后切 tag（生效变成一次显式升级）。跟分支意味着**推一次坏配置会让所有项目一起坏**，所以切换时机是"共享配置一周没改过"。
