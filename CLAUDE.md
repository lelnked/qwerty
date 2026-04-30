# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 开发指令

### 基础命令
- 启动开发服务器: `yarn dev` (默认端口: 5173)
- 项目构建: `yarn build` (输出目录: `dist` 或 `build`)
- 代码规范检查: `yarn lint`
- 代码格式化: `yarn prettier`

### 测试与验证
- 运行 E2E 测试: `yarn test:e2e` (Playwright)
- 环境检查: `scripts/pre-check.sh` (macOS)

## 项目架构

### 技术栈
- **核心**: React 18 + Vite + TypeScript
- **状态管理**: Jotai (原子化状态)
- **数据库**: Dexie.js (IndexedDB 封装)
- **样式**: Tailwind CSS + Lucide React (图标) + unplugin-icons
- **反馈**: react-hot-toast (轻量级通知)

### 核心布局与导航
- **全局布局**: `src/components/Layout.tsx` 定义了应用的主体结构，集成了左侧固定侧边栏 (`Sidebar`) 和顶部工具栏 (`Header`)。
- **侧边栏**: `src/components/Sidebar` 处理全局导航，包括核心练习、生词本、词库、统计等入口。
- **动态 Header**: `src/components/Header` 用于放置各页面特有的控制按钮（如词典切换、发音开关）。

### 数据持久化 (Dexie.js)
- **数据库名称**: `RecordDB`
- **关键表定义**:
    - `wordRecords`: 记录单词练习的表现数据。
    - `chapterRecords`: 记录章节练习的统计结果。
    - `newWords`: 用户收藏的生词本（包含单词、释义、发音、时间戳）。
- **数据管理**: 数据库定义位于 `src/utils/db/index.ts`，模型位于 `src/utils/db/record.ts`。

### 关键设计模式
- **响应式路由**: 在 `src/index.tsx` 中根据 `window.innerWidth` 自动切换移动端页面 (`/mobile`)。
- **生词管理**: 通过 `src/hooks/useNewWords.ts` 封装生词的增删改查逻辑，并在练习界面支持 `Ctrl+S` 快捷键收藏。
- **样式规范**: 优先使用 Tailwind 类名，复杂组件配合 CSS Modules。侧边栏及部分组件采用 `backdrop-blur` (毛玻璃) 效果。
