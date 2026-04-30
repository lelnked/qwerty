import { CTRL } from '@/utils'

type Hint = {
  keys: string[]
  label: string
}

const HINTS: Hint[] = [
  { keys: [CTRL, 'J'], label: '播放发音' },
  { keys: [CTRL, 'M'], label: '掌握' },
  { keys: [CTRL, 'S'], label: '生词' },
  { keys: ['Tab'], label: '显示翻译' },
  { keys: [CTRL, 'Shift', '←/→'], label: '上/下一个' },
]

export default function KeyboardHints() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
      {HINTS.map((hint, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          {hint.keys.map((k, i) => (
            <kbd
              key={i}
              className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-600 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {k}
            </kbd>
          ))}
          <span className="ml-1">{hint.label}</span>
        </div>
      ))}
    </div>
  )
}
