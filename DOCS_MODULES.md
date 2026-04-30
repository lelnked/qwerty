# Qwerty Learner 模块与组件功能分析文档

本文档详细描述了 Qwerty Learner 各核心模块及其组件的功能，旨在帮助开发人员理解项目结构与业务逻辑。

---

## 1. 核心页面 (Pages)

### 1.1 Typing (打字练习页)
项目的核心功能入口，负责主要的打字记忆逻辑。
- **`index.tsx`**: 练习页主入口，整合 WordPanel、Progress、ResultScreen 等。
- **`WordPanel/`**: 单词展示与输入核心。
    - **`Word/`**: 单词字母渲染，根据输入状态显示颜色。
    - **`InputHandler/`**: 拦截用户输入并与当前单词进行比对。
    - **`Translation/`**: 显示当前单词的释义。
    - **`Phonetic/`**: 显示音标及控制发音。
- **`ResultScreen/`**: 章节练习完成后的结果展示，包含速度（KPM）、准确率等图表。
- **`WordList/`**: 侧边栏单词列表，显示当前章节的所有单词。
- **`Setting/`**: 练习设置，包括发音配置、显示配置（字体大小、忽略大小写等）。
- **`Progress/`**: 练习进度条显示。

### 1.2 Gallery & Gallery-N (词库选择页)
用户浏览并选择不同分类词库的页面。
- **`CategoryNavigation`**: 词库分类导航（如 CET-4, Coder, API 等）。
- **`DictionaryCard`**: 单个词库的展示卡片。
- **`DictDetail`**: 词库详情，显示章节列表及各章节完成情况。

### 1.3 Analysis (数据分析页)
可视化展示用户的练习历史。
- **`HeatmapCharts`**: 练习频率热力图。
- **`KeyboardWithBarCharts`**: 键盘布局热力图，显示不同按键的准确率或输入频率。
- **`LineCharts`**: 展示用户打字速度随时间的变化趋势。

### 1.4 ErrorBook (错题本)
管理练习中输入错误的单词。
- **`ErrorRow`**: 错题列表行，支持查看错误详情和发音。
- **`RowDetail`**: 展示该单词具体的错误记录及统计信息。

---

## 2. 通用组件 (Components)

- **`Header`**: 顶部导航，包含 logo、GitHub 链接、模式切换。
- **`Footer`**: 页脚信息。
- **`ui/`**: 基础 UI 组件库（基于 Radix UI / Tailwind），包括 Button, Dialog, Tabs, Table 等。
- **`WordPronunciationIcon`**: 统一的发音图标组件。
- **`InfoPanel`**: 侧边信息面板。
- **`DonateCard`**: 捐赠卡片组件。

---

## 3. 状态管理 (Store)

使用 **Jotai** 进行原子化状态管理。
- **`index.ts`**: 全局核心 Atom，如 `currentDictIdAtom`（当前词库）、`currentChapterAtom`（当前章节）、`isOpenDarkModeAtom`（黑夜模式）。
- **`atomForConfig.ts`**: 封装了配置类的 Atom，自动与本地存储同步。
- **`reviewInfoAtom.ts`**: 管理复习模式相关的状态。

---

## 4. 自定义 Hook (Hooks)

- **`usePronunciation`**: 控制单词发音逻辑。
- **`useKeySounds`**: 管理按键反馈音效。
- **`useSpeech`**: 系统语音合成（TTS）接口封装。
- **`useWordList`**: 负责从资源加载单词数据并管理章节切换。

---

## 5. 工具类与数据 (Utils & Resources)

- **`src/resources/dictionary.ts`**: 定义了所有可用词库的元数据及其数据加载路径。
- **`src/utils/db/`**: 使用 Dexie.js 处理本地数据库。
    - `record.ts`: 处理打字练习记录的存储与读取。
- **`src/utils/sounds/`**: 按键音效资源管理。
- **`src/constants/`**: 存放全局常量，如默认字体、本地存储的 Key 等。
