# Tasks: 我的课程包与生词本

**Input**: Design documents from `/specs/001-course-package-vocabulary/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Spec 未强制 TDD；本计划仅在收尾阶段补充少量 Playwright E2E（覆盖 P1/P2 的 acceptance 主线），不为每个组件写单测。

**Organization**: 任务按 user story 分阶段组织，US1（课程包）与 US2（生词本）均为 P1，可并行；US3（练习中跳过）为 P2，依赖 US2 中的 newWords 数据流。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件，无未完成依赖）
- **[Story]**: US1 / US2 / US3（仅 user story 阶段需要）
- 描述中包含精确文件路径

## Path Conventions

- 单 SPA 项目：根目录下 `src/`、`public/`、`e2e/`（如尚未存在则新增）
- 全部路径相对仓库根 `/home/lanshuangping/personal/qwerty/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 引入新依赖、目录骨架。

- [X] T001 安装 fuse.js 依赖：在仓库根执行 `yarn add fuse.js` 并提交 `package.json` / `yarn.lock`
- [X] T002 [P] 创建静态数据目录 `public/coursepacks/` 并放入占位 `index.json`（空数组）以便构建通过
- [X] T003 [P] 创建源码骨架目录：`src/pages/CoursePack/`、`src/pages/CoursePack/components/`、`src/pages/CoursePack/hooks/`、`src/api/`（如不存在）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 升级 Dexie schema、定义共享类型/契约，所有 user story 都依赖这些。

**⚠️ CRITICAL**: 完成本阶段后，US1 与 US2 才可启动。

- [X] T004 在 `src/utils/db/record.ts` 新增 `IActiveCourseMapEntry` 接口与 `ActiveCourseMapEntry` 类（字段见 data-model.md）
- [X] T005 在 `src/utils/db/index.ts` 中将 Dexie schema 升级到 `version(5)`，新增 `activeCourseMap: '++id,&coursePackId'` 表，并在底部 `db.activeCourseMap.mapToClass(ActiveCourseMapEntry)`
- [X] T006 [P] 新增类型文件 `src/api/coursePackProvider.ts`：定义 `CoursePackSummary`、`Course`、`CoursePack`、`CoursePackProvider` 接口与 `NotFoundError`（与 contracts/coursepack-provider.ts.md 一致），并实现并默认导出 `LocalJsonCoursePackProvider`，从 `/coursepacks/index.json` 与 `/coursepacks/<id>.json` 读取
- [X] T007 [P] 新增 `src/store/coursePack.ts`：导出 `coursePacksAtom`、`currentCoursePackAtom`、`coursePackLoadingAtom` 与一个 `loadCoursePackErrorAtom`，配套写入入口
- [X] T008 [P] 在 `src/components/Sidebar/` 中新增"我的课程包"入口（链接到 `/course-pack`），保持现有生词本入口不变；图标使用 lucide-react `Library`
- [X] T009 在 `src/index.tsx` 注册新路由：`/course-pack` → 列表页，`/course-pack/:id` → 详情页，使用 `lazy()` 与 Suspense 与现有 NewWords 一致

**Checkpoint**: Dexie 已升级、provider/atoms/sidebar 就绪；US1 与 US2 可并行启动。

---

## Phase 3: User Story 1 - 浏览并进入课程包学习 (Priority: P1) 🎯 MVP

**Goal**: 用户访问"我的课程包"，能看到列表、进入详情、点击课程跳到练习页。

**Independent Test**: 在登录态下访问 `/course-pack` 能看到课程包卡片网格；点击免费包进入详情看到课程列表；点击课程跳到主练习页（`/`）并已切换到对应 dict + chapter。

- [X] T010 [US1] 编写示例数据：`public/coursepacks/index.json` 至少 3 个包（含 1 个 `isFree: false`），并为每个包创建 `public/coursepacks/<id>.json`，课程引用 `cet4`/`cet6` 等已存在 dictId
- [X] T011 [P] [US1] 实现 `src/pages/CoursePack/components/CoursePackCard.tsx`：展示封面、标题、描述、`isFree` 角标；`onClick` 事件由父组件处理
- [X] T012 [P] [US1] 实现 `src/pages/CoursePack/components/CourseCard.tsx`：展示课程标题、描述、`completionCount`（props 入参）；`disabled` 时灰显
- [X] T013 [P] [US1] 实现 `src/pages/CoursePack/hooks/useCoursePack.ts`：提供 `useCoursePackList()` 与 `useCoursePackDetail(id)`，内部调用 provider，结合 `coursePacksAtom`/`currentCoursePackAtom` 缓存与 loading/error 状态
- [X] T014 [US1] 新增 `src/pages/CoursePack/index.tsx`（列表页）：使用 Layout 包裹，调用 `useCoursePackList()`，渲染网格；加载态走 `Loading`，错误态显示重试按钮；点击免费包 navigate 到 `/course-pack/:id`，点击非免费包用 `react-hot-toast` 提示 "该课程包需要会员权限"
- [X] T015 [US1] 新增 `src/pages/CoursePack/Detail.tsx`（详情页）：使用 `useParams()` 取 id，调用 `useCoursePackDetail`，渲染课程网格；通过 `useLiveQuery(() => db.chapterRecords.where(...).count())` 派生每个课程的 `completionCount`；点击课程时按 T016 流程跳转
- [X] T016 [US1] 在 `src/pages/CoursePack/hooks/useCoursePack.ts` 增加 `enterCourse(course)`：写入 `db.activeCourseMap.put({ coursePackId, courseId, dictId, chapter, timeStamp })`，再用 Jotai 的 setter 设置 `currentDictIdAtom = course.dictId`、`currentChapterAtom = course.chapter`，最后 `navigate('/')`
- [X] T017 [US1] 在详情页/列表页加入空态与"课程包不存在"占位：列表为空时展示 `Library` 图标 + "还没有课程包" 文案；详情页 `NotFoundError` 时返回提示并提供"返回列表"按钮
- [X] T018 [P] [US1] 在 `src/pages/CoursePack/index.tsx` 与 `Detail.tsx` 顶部增加面包屑/标题栏，确保移动端在 `/mobile` 路由不会渲染该页面（沿用 `src/index.tsx` 既有判断即可，无需额外改动）

**Checkpoint US1**: `/course-pack` 列表与详情、跳转到 Typing 全链路通畅，Acceptance Scenarios 1-4 全部可手测通过。

---

## Phase 4: User Story 2 - 收藏与管理生词本 (Priority: P1)

**Goal**: 用户在练习中加入生词，进入 `/new-words` 看到总数、模糊搜索、删除；重复加入有提示。

**Independent Test**: 触发加入生词后访问 `/new-words` 能看到该条目并被排在最前；输入关键字（含部分模糊字符）能筛选；点击删除条目消失；尝试重复加入显示"已在生词本中"。

> 说明：qwerty 已具备 `useNewWords` 与 `pages/NewWords/index.tsx`。本阶段为对齐 spec 的增量改造，不重写已实现的部分。

- [X] T019 [US2] 在 `src/pages/NewWords/index.tsx` header 区域新增"总数"展示（`Total: {filteredWords.length} / {words.length}`），与 spec FR-008 对齐
- [X] T020 [US2] 在 `src/pages/NewWords/index.tsx` 用 Fuse.js 替换现有 `filter(...includes...)`：以 `word` 与 `meaning` 为 keys，threshold 0.4；`searchTerm` 为空时返回完整列表
- [X] T021 [P] [US2] 在 `src/pages/NewWords/index.tsx` 删除按钮加入 toast 反馈（沿用 `react-hot-toast`，文案"已从生词本移除"），保持当前 `useLiveQuery` 自动刷新逻辑
- [X] T022 [P] [US2] 校对 `src/hooks/useNewWords.ts`：保留现有"已在生词本中"提示；将查询条件改为忽略大小写匹配（`db.newWords.where('word').equalsIgnoreCase(word.name)`），与 FR-007 一致
- [X] T023 [P] [US2] 在 `src/components/Sidebar/` 中确保"生词本"入口位置紧邻"我的课程包"，并显示当前总数（用 `useLiveQuery(() => db.newWords.count())`）
- [X] T024 [US2] 网络/IndexedDB 异常时（add/delete catch 分支）做乐观回滚：`useNewWords` 中 add 失败时移除前置 toast 成功通知（已捕获 catch，仅需保证错误 toast 出现且不留下脏数据）；列表页 delete 失败时 toast.error("删除失败")

**Checkpoint US2**: 生词本主流程在桌面端可用，搜索与总数符合 spec。

---

## Phase 5: User Story 3 - 在练习中跳过/标注已收藏内容 (Priority: P2)

**Goal**: Typing 章节装载时过滤已加入生词本的单词，整章被收藏时显示 fallback。

**Independent Test**: 提前为 `cet4` 章节 0 中的若干单词加入生词本，进入该章节练习，确认这些单词不再出现；当所有单词都被收藏时，进入章节看到引导文案而非空白。

- [X] T025 [P] [US3] 新增 `src/hooks/useSkipMasteredWord.ts`：基于 `useLiveQuery(() => db.newWords.where('dictId').equals(dictId).toArray())` 返回一个 `Set<string>`（lowercase word.name）
- [X] T026 [US3] 在 Typing 章节加载点（`src/pages/Typing/store` 或对应 `useChapter` 装载逻辑）插入过滤：在原始 `chapterWords` 计算之后、装入 `dispatch(SET_CHAPTER_WORDS, ...)` 之前，使用 `useSkipMasteredWord(currentDictId)` 的 set 过滤；保持 `wordCount` 等下游字段一致
- [X] T027 [US3] 当过滤后章节单词列表为空时，在 Typing 主区域渲染 fallback：图标 + 文案"该章节内容已全部加入生词本，可前往生词本查看" + 跳转 `/new-words` 的按钮
- [X] T028 [P] [US3] 在 `src/pages/Typing/` 主组件入口添加注释/常量说明跳过策略（默认跳过），便于未来开关化；不引入新配置项

**Checkpoint US3**: 练习中跳过逻辑生效，整章空态有兜底。

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: 端到端验收、文档同步、回归测试。

- [ ] T029 [P] 新增 `e2e/coursepack.spec.ts`：覆盖"打开列表 → 进入免费包 → 进入课程 → 启动练习"主链路（断言 URL 与可见文本）
- [ ] T030 [P] 新增 `e2e/vocabulary.spec.ts`：覆盖"练习中加入生词 → 访问 /new-words → 搜索 → 删除"
- [ ] T031 [P] 新增 `e2e/skip-mastered.spec.ts`：覆盖"预置生词 → 进入对应章节 → 断言被跳过/整章空态文案"
- [X] T032 在 `CLAUDE.md` 数据持久化小节追加 `activeCourseMap` 表说明与"我的课程包"导航入口
- [ ] T033 `yarn lint && yarn prettier --check .` 全量通过；修复本特性引入的告警
- [ ] T034 `yarn build` 成功且 bundle 增量在预算内（≤ 30 KB gzip）；如超出，定位并修复
- [ ] T035 手测 quickstart.md 中 1~5 步全部通过；记录任何偏差并回填到 spec 或本任务清单

---

## Dependencies

```text
Setup (T001-T003)
        │
        ▼
Foundational (T004-T009)
        │
        ├─────────────┬──────────────┐
        ▼             ▼              ▼
      US1            US2            (等待 US2 完成 newWords 行为对齐)
   (T010-T018)    (T019-T024)
        │             │              │
        └─────────────┴──────────────▶  US3 (T025-T028)
                                          │
                                          ▼
                                       Polish (T029-T035)
```

- US1 与 US2 之间无强依赖，可并行；US3 依赖 US2 完成"忽略大小写匹配"等约定。
- Polish 阶段最后执行；T032/T035 取决于 US1+US2+US3 都已完成。

## Parallel Execution Examples

- **Setup**：T002 与 T003 可并行（不同目录）。
- **Foundational**：T006、T007、T008 互不冲突，可并行；T009 需在 T006/T007 完成后（依赖类型与 atom 导出）。
- **US1**：T011/T012/T013 可三路并行（独立组件 + hook）；T014/T015 依赖三者；T016 可与 T017 并行编写。
- **US2**：T021/T022/T023 可并行（不同文件）；T019 与 T020 在同一文件需顺序提交。
- **US3**：T025/T028 可与 T026/T027 并行（独立 hook 与主流程改造）。
- **Polish**：T029/T030/T031 可三路并行。

## Implementation Strategy

- **MVP**：Setup + Foundational + US1 即构成最小可演示版本（"我的课程包"完整可用，生词本沿用现状），可独立交付。
- **第二增量**：合入 US2，使生词本与 spec 对齐（搜索升级、总数、忽略大小写）。
- **第三增量**：合入 US3，闭环"练习中跳过"。
- **收尾**：Polish 阶段补 E2E 与文档。
