# Phase 1 — Data Model

## Entity: CoursePack

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | 全局唯一，建议 kebab-case |
| title | string | yes | 展示名 |
| description | string | yes | 列表卡片上 1-2 行简介 |
| cover | string (URL/path) | yes | 相对 `public/` 的封面图路径 |
| isFree | boolean | yes | 本期固定 `true`，预留会员开关 |
| courses | Course[] | yes | 顺序即学习路径 |

来源：静态 JSON（`public/coursepacks/<packId>.json`）。

## Entity: Course

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | 同包内唯一，可用 `${dictId}-${chapter}` |
| title | string | yes | 课程展示名 |
| description | string | no | 可选副标题 |
| dictId | string | yes | 映射 qwerty `Dictionary.id` |
| chapter | number | yes | 0-based |
| coursePackId | string | yes | 反向引用 |

派生：`completionCount` = `db.chapterRecords.where({ dict: dictId, chapter }).count()`，仅在视图层计算，不入表。

## Entity: ActiveCourseMapEntry (Dexie)

记录每个课程包下用户最近一次进入的课程，用于侧边栏/Header 快速恢复。

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | number (auto) | yes | Dexie 主键 |
| coursePackId | string | yes | 索引字段 |
| courseId | string | yes | 课程包内 Course.id |
| dictId | string | yes | 跳转练习时直接使用 |
| chapter | number | yes | 同上 |
| timeStamp | number | yes | 更新时间，ms epoch |

约束：`(coursePackId)` 唯一；写入时使用 `db.activeCourseMap.put({ coursePackId, ... })` 实现 upsert。

## Entity: NewWord (复用现有，无变更)

定义见 `src/utils/db/record.ts` 中 `INewWord`。本特性只新增使用方：

- 在 Typing 章节装载时按 `dictId` + `word.name.toLowerCase()` 构建集合用于过滤。
- 本特性不改字段，但把 spec 中"忽略大小写"的去重升级为代码侧统一 `toLowerCase()`（已是当前行为，无需改造）。

## Dexie schema 升级

```text
this.version(5).stores({
  wordRecords: '++id,word,timeStamp,dict,chapter,wrongCount,[dict+chapter]',
  chapterRecords: '++id,timeStamp,dict,chapter,time,[dict+chapter]',
  reviewRecords: '++id,dict,createTime,isFinished',
  newWords: '++id,word,dictId,timeStamp',
  activeCourseMap: '++id,&coursePackId',
})
```

仅新增 `activeCourseMap` 一张表，老表保留以保证升级零风险。

## State (Jotai)

| Atom | 类型 | 作用 |
|------|------|------|
| `coursePacksAtom` | `CoursePack[]` | 列表页缓存（首次访问后保留） |
| `currentCoursePackAtom` | `CoursePack \| undefined` | 详情页当前包 |
| `coursePackLoadingAtom` | `boolean` | 列表/详情加载态 |

不放入 Dexie，跨 session 重新拉取（成本低，文件直读）。

## Validation Rules（视图/写入边界）

- 进入详情页时 `coursePackId` 不在清单中 → 显示"课程包不存在"占位 + 返回列表按钮。
- `Course.dictId` 不在 `resources/dictionary.ts` 已知列表中 → 卡片标"暂不可用"，禁用点击。
- 加入生词本：相同 `(dictId, word)` 已存在则提示并 no-op。
