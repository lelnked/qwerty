import { TypingContext } from '../../store'
import { useContext, useEffect, useState } from 'react'

export default function Progress({ className }: { className?: string }) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0)

  const colorSwitcher: { [key: number]: string } = {
    0: 'bg-emerald-300 dark:bg-emerald-400',
    1: 'bg-emerald-400 dark:bg-emerald-500',
    2: 'bg-emerald-500 dark:bg-emerald-600',
  }

  useEffect(() => {
    const newProgress = Math.floor((state.chapterData.index / state.chapterData.words.length) * 100)
    setProgress(newProgress)
    const colorPhase = Math.floor(newProgress / 33.4)
    setPhase(colorPhase)
  }, [state.chapterData.index, state.chapterData.words.length])

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex h-1 overflow-hidden bg-gray-100 dark:bg-gray-700/60">
        <div
          style={{ width: `${progress}%` }}
          className={`transition-all duration-500 ease-out ${colorSwitcher[phase] ?? 'bg-emerald-400'}`}
        ></div>
      </div>
    </div>
  )
}
