# Phase 0 — Research

## R1. 课程包数据源

- **Decision**: 本地静态 JSON（`public/coursepacks/`）+ TypeScript provider 抽象层。
- **Rationale**: qwerty 是纯前端 SPA，没有后端服务；引入后端不在本期范围。本地 JSON 满足"我的课程包列表 + 详情"的渲染需求，provider 接口预留远端实现以对齐 julebu.co/earthworm 形态。
- **Alternatives considered**:
  - 直接调 julebu.co 公网 API：跨域 + 鉴权复杂，且与 qwerty 架构不一致。
  - 把课程包写成 TS 常量：和现有 `resources/dictionary.ts` 风格一致，但课程包带封面与多课程的层级，JSON 更易扩充与外部维护。

## R2. 课程与现有 dictionary 的映射

- **Decision**: 一个"课程"= 一个 (dictId, chapter) 元组；一个"课程包"= 一组按学习路径排序的课程，且课程可跨多个 dict。
- **Rationale**: qwerty 既有的练习入口本就是 `/<dictId>/chapter/<n>`，复用即可，无需重新组织词库；"课程包"只是上层的有序聚合视图。
- **Alternatives considered**: 让一个课程对应一个完整 dict — 粒度过粗，违背 julebu.co"30~50 词一节"的产品形态。

## R3. 用户进度（已完成次数）来源

- **Decision**: 直接基于现有 `chapterRecords` 表，按 `(dict, chapter)` 分组计数得出 `completionCount`。
- **Rationale**: 既有数据复用，零迁移；与 `pages/Analysis` 现状口径一致。
- **Alternatives considered**: 新建 `coursePackProgress` 表存计数 — 数据冗余且容易与 `chapterRecords` 不同步。改为只用一张轻量索引表 `activeCourseMap` 记录"上次进入的课程"，计数仍走 `chapterRecords`。

## R4. 生词本搜索升级

- **Decision**: 引入 Fuse.js（与 earthworm 同款），保留对 `word` 与 `meaning` 双字段的模糊匹配。
- **Rationale**: 已有列表搜索是简单 `includes`，遇到拼写偏差/近义关键字会漏；Fuse.js ~6KB gzip，开销可接受。
- **Alternatives considered**: MiniSearch（更重）、自写 trigram（不必要的复杂度）。

## R5. 练习中"已收藏即跳过"

- **Decision**: 在 Typing 章节加载阶段（`Typing` store 的 chapterWords 装载点）插入过滤器：`words.filter(w => !newWordsSet.has(w.name.toLowerCase()))`；通过新增 `useSkipMasteredWord(dictId)` hook 提供 set。
- **Rationale**: 从源头屏蔽即可让所有下游逻辑（计数、进度、tip 显示）自然忽略，无需改各处。`react-hooks` + `dexie-react-hooks/useLiveQuery` 实时同步。
- **Risk / Mitigation**: 章节内全部条目都被收藏 → 章节为空，UI 出现空态。处理：保留 fallback，显示"该章节内容已全部加入生词本，可前往生词本查看"。
- **Alternatives considered**: 仅视觉标注、不跳过 — 与 spec 默认策略不符；后续可作为可配置项再加。

## R6. 会员/免费判定

- **Decision**: 字段保留 `isFree: boolean`，本期默认全部 `true`；非会员尝试进入 `isFree=false` 的包时统一展示"该课程包需要会员权限"toast 并阻止跳转。
- **Rationale**: 维持与 julebu.co 字段对等，未来接入会员体系只需替换判定函数。
- **Alternatives considered**: 直接删字段 — 失去未来扩展位。

## R7. Dexie schema 升级

- **Decision**: 从 v4 升级到 v5，新增 `activeCourseMap` 表（`++id, coursePackId`），`newWords` 与 `chapterRecords` 不动。
- **Rationale**: Dexie 对"仅新增表"的版本升级是无损的；不改老表 = 零迁移风险。
- **Alternatives considered**: 把 activeCourseMap 放到 localStorage — 与 RecordDB 现有模式割裂，并且容量小且无索引。

## R8. 路由设计

- **Decision**: 新增 `/course-pack`（列表）、`/course-pack/:id`（详情）；详情中点击课程跳到现有 Typing 入口（先 `setCurrentDictId(dictId)`、`setCurrentChapter(chapter)`，再 `navigate('/')`）。
- **Rationale**: 不破坏 Typing 现有路由，"开始练习"的会话由 Jotai store 驱动；与 earthworm 在 Pinia 中的 `useNavigation().gotoCourseList` 形态等价。
- **Alternatives considered**: 新增 `/course-pack/:id/:courseId` 直达练习 — Typing 当前不接受 URL 参数驱动，需要更大改造，超出 MVP 范围。
