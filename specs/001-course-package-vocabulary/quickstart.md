# Quickstart — 我的课程包与生词本

面向接手开发者，5 步在本地复现并验收。

## 1. 安装与启动

```bash
yarn          # 首次安装
yarn add fuse.js   # 本特性新增依赖
yarn dev      # http://localhost:5173
```

## 2. 准备示例课程包数据

在 `public/coursepacks/` 下创建：

- `index.json` — 至少包含 1 个免费包 + 1 个会员专享包，方便验证 spec FR-003。
- `<packId>.json` — 每个包至少包含 2 个 course，且 `dictId` 指向 `src/resources/dictionary.ts` 已存在的词库（如 `cet4`、`cet6`）。

JSON 结构需通过 [contracts/coursepack.schema.json](./contracts/coursepack.schema.json) 校验。

## 3. 数据库升级验证

启动后打开 DevTools → Application → IndexedDB → `RecordDB`，确认存在 `activeCourseMap` 表，且 `newWords` 数据未丢失（升级 v4→v5 仅追加表）。

## 4. 端到端验收（手测脚本）

1. 访问 `/course-pack`：看到课程包卡片网格 + 加载态消失。
2. 点击免费包 → 进入详情，列出课程；点击会员包 → toast 提示且不跳转。
3. 详情页点击任一课程 → 跳到主练习页，开始练习。
4. 练习中按 `Ctrl+S` 收藏当前单词，访问 `/new-words`：列表顶部显示总数，输入关键字模糊搜索，点击删除可移除。
5. 退出练习再次进入同一章节：被收藏的单词不再出现；若整章被收藏，看到引导文案。

## 5. Playwright 用例落点

- `cypress 已停用，新增到 e2e/coursepack.spec.ts`（沿用项目现有 Playwright 配置）：
  - `should list course packs and open a free pack`
  - `should block member-only pack with toast`
  - `should add a word to vocabulary book and skip it on next visit`

## 验收 Checklist 来源

- 功能需求 FR-001 ~ FR-015：见 [spec.md](./spec.md#functional-requirements)。
- 性能/体验：[spec.md Success Criteria](./spec.md#measurable-outcomes)。
