# Provider Contract: `coursePackProvider`

实现位置：`src/api/coursePackProvider.ts`。本期只提供 `LocalJsonCoursePackProvider`，预留远端实现。

```ts
export interface CoursePackSummary {
  id: string
  title: string
  description: string
  cover: string
  isFree: boolean
}

export interface Course {
  id: string
  title: string
  description?: string
  dictId: string
  chapter: number
  coursePackId: string
}

export interface CoursePack extends CoursePackSummary {
  courses: Course[]
}

export interface CoursePackProvider {
  /** 返回当前用户拥有的课程包清单（本期 = 全部静态包） */
  fetchCoursePacks(): Promise<CoursePackSummary[]>
  /** 单包详情；未找到时抛出 NotFoundError */
  fetchCoursePack(id: string): Promise<CoursePack>
  /** 是否对当前用户开放（本期：!isFree → false，否则 true） */
  canAccess(pack: CoursePackSummary): boolean
}

export class NotFoundError extends Error {}
```

## 行为约定

- `fetchCoursePacks()`：从 `/coursepacks/index.json` 读取并按 schema 校验；网络/解析错误抛 `Error`，调用方负责展示重试。
- `fetchCoursePack(id)`：从 `/coursepacks/${id}.json` 读取；返回前对 `courses` 中每个 `dictId` 与 `resources/dictionary.ts` 比对，把不存在的项 mark 为 disabled（在 UI 层而非 provider 层处理，provider 仅原样返回）。
- `canAccess(pack)`：本期 `pack.isFree === true ? true : false`。未来接入会员后改为 `pack.isFree || user.isMember`。

## Error model

| 场景 | 抛出类型 | UI 表现 |
|------|----------|---------|
| 网络失败 | Error | "加载失败，请重试" + Retry 按钮 |
| JSON 不符合 schema | Error | 同上，并 console.error 详情 |
| `id` 不存在 | NotFoundError | 详情页占位 "课程包不存在" |

## 替换为远端实现的迁移路径

新增 `RemoteHttpCoursePackProvider`，构造函数接收 baseURL/auth；接口签名与本地实现一致。在 `coursePackProvider.ts` 顶层导出根据环境变量切换的实例即可，无需修改任何调用处。
