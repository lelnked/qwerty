# Implementation Plan: 我的课程包与生词本

**Branch**: `001-course-package-vocabulary` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-course-package-vocabulary/spec.md`

## Summary

参考 julebu.co 与 earthworm 源码，将"我的课程包"与"生词本"两条用户主线落地到 qwerty（React + Vite + Jotai + Dexie）。

技术取向：

- **课程包**：qwerty 当前没有等价模块。以"课程包 → 课程（可练习单元）"两层结构新增 `pages/CoursePack/` 路由与 `coursePackAtom` 状态；数据源采用本地静态 JSON（`public/coursepacks/index.json` + 每包详情）+ Dexie 表（`coursePackProgress`, `activeCourseMap`）记录用户进度。后端集成在本期不做，但所有读取入口走一个 `coursePackProvider` 抽象，便于后续替换为远端 API（与 earthworm `/course-pack` 接口形态对齐）。
- **生词本**：复用现有 `pages/NewWords` 与 Dexie `newWords` 表，新增三项能力：(1) 总数显示与 Fuse.js 模糊搜索升级；(2) 在 Typing 流中按已配置策略跳过或标注 `newWords` 条目（默认跳过）；(3) 重复入库提示已有，保留并按 spec 文案统一。

## Technical Context

**Language/Version**: TypeScript 5.x，React 18，Node 18+ 工具链
**Primary Dependencies**: Vite, Jotai, Dexie + dexie-react-hooks, Tailwind CSS, react-router-dom v6, react-hot-toast, lucide-react，新增 `fuse.js`
**Storage**: 浏览器端 Dexie/IndexedDB（库名 `RecordDB`）；课程包元数据走静态 JSON
**Testing**: 已有 Playwright E2E（`yarn test:e2e`）；本特性新增 1-2 条核心 happy-path 用例 + 必要的纯函数单测（vitest，如尚未配置则评估是否引入；优先使用 Playwright）
**Target Platform**: Chromium 最新版，桌面端为主，移动端走现有 `/mobile` 路由
**Project Type**: 单页前端应用（Vite SPA）
**Performance Goals**: 课程包列表/详情首屏可交互 ≤ 2s；生词本 1000 条以内搜索保持流畅（输入到结果刷新感知 < 100ms）
**Constraints**: 离线可用（生词本读写、已加载课程包详情）；包体积新增 ≤ 30 KB gzip（Fuse.js ~6KB）；不破坏既有 Dexie 数据
**Scale/Scope**: 个人学习应用，预计每用户 ≤ 1k 生词、≤ 50 课程包；新增 ~6 个组件 + 3 个路由页 + 1 个 Dexie schema 升级

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

仓库 `.specify/memory/constitution.md` 仍为模板占位（未实际制定原则）。在缺乏明确章程约束的情况下，本计划自我对齐如下隐含原则，并在 Phase 1 完成后复核：

- **简约优先**：只新增必要的页面/状态/表；复用 `Layout`/`Header`/`Sidebar` 与现有 `newWords` 表，不重写生词本。
- **离线优先 / 本地数据**：与 qwerty 既有 Dexie-first 风格一致；课程包数据本地化，远端化通过 provider 接口预留。
- **测试可达性**：核心用户旅程（US1, US2, US3）必须可用 Playwright 端到端验证。
- **不引入未授权依赖**：仅新增 fuse.js 一个轻量库，且由现有 NewWords 升级所需。

无违反，**Initial Constitution Check: PASS**。

## Project Structure

### Documentation (this feature)

```text
specs/001-course-package-vocabulary/
├── plan.md              # 本文件
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出
├── contracts/           # Phase 1 输出（provider 与 JSON schema）
│   ├── coursepack.schema.json
│   └── coursepack-provider.ts.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

仓库为单 SPA，无 frontend/backend 拆分。受影响目录：

```text
public/
└── coursepacks/
    ├── index.json                      # 课程包清单
    └── <packId>.json                   # 各课程包课程列表（与 dict/chapter 映射）

src/
├── pages/
│   ├── CoursePack/                     # 新增：我的课程包列表 + 详情
│   │   ├── index.tsx                   # 列表页 (/course-pack)
│   │   ├── Detail.tsx                  # 详情页 (/course-pack/:id)
│   │   ├── components/
│   │   │   ├── CoursePackCard.tsx
│   │   │   └── CourseCard.tsx
│   │   └── hooks/useCoursePack.ts
│   ├── NewWords/
│   │   └── index.tsx                   # 改造：Fuse.js 搜索 + 总数 UI 对齐
│   └── Typing/
│       └── ...                         # 改造：消费 newWords 跳过/标注
├── store/
│   └── coursePack.ts                   # 新增：Jotai atoms
├── hooks/
│   ├── useNewWords.ts                  # 已有，保持 API
│   └── useSkipMasteredWord.ts          # 新增：在 Typing 中读取 newWords 集合
├── utils/db/
│   ├── index.ts                        # Dexie 升级到 v5：增加 coursePackProgress, activeCourseMap
│   └── record.ts                       # 新增 ICoursePackProgress, IActiveCourseMapEntry
└── api/
    └── coursePackProvider.ts           # 新增：本地 JSON provider；预留远端实现位
```

**Structure Decision**: 单 SPA 项目，按 `src/pages/<Feature>/` + `src/utils/db` + `src/store` 现有惯例扩展，不引入新顶层目录。

## Complexity Tracking

无违规需要论证，未填写。

## Phase 0 — 输出 `research.md`

详见 [research.md](./research.md)。要点：

- 课程包数据源选型（本地 JSON vs 远端 API）：选本地 JSON + provider 抽象，理由是 qwerty 现状无后端基础设施。
- 模糊搜索：选 Fuse.js（earthworm 同款，体积可接受），淘汰自写 trigram。
- "已收藏即跳过"实现：在 Typing 进入章节时，从 Dexie 读取该 dict 的 newWords 集合，过滤 chapterWords；保留可视化标记位以备未来配置。
- 会员判定：本期没有会员体系，统一视为"全免费"，但 UI 保留 `isFree` 字段渲染分支，便于未来开关。
- Dexie 升级策略：从 v4 → v5，仅新增表，不改既有表，零风险迁移。

## Phase 1 — 输出 `data-model.md` / `contracts/` / `quickstart.md`

- [data-model.md](./data-model.md)：定义 5 个实体（CoursePack, Course, CoursePackProgress, ActiveCourseMapEntry, NewWord 复用）。
- [contracts/coursepack.schema.json](./contracts/coursepack.schema.json)：静态 JSON schema，描述课程包清单与单包详情。
- [contracts/coursepack-provider.ts.md](./contracts/coursepack-provider.ts.md)：TypeScript 接口契约，定义 provider 三个方法。
- [quickstart.md](./quickstart.md)：开发者本地复现 5 步流程。

### Agent context update

将本计划链接更新到 `CLAUDE.md` 的 SPECKIT 块中（若存在标记则替换，否则追加）。

## Post-Design Constitution Re-Check

- 简约：新增 1 个 schema 升级、3 个页面文件、1 个 provider，无多余抽象。✅
- 离线：所有读路径在静态 JSON + Dexie，无网络强依赖。✅
- 测试：3 条 Playwright 用例覆盖 P1/P2 全部 acceptance 主线。✅
- 依赖：仅 +fuse.js。✅

**Post-Design Constitution Check: PASS**。
