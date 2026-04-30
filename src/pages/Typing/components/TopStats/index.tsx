import { TypingContext } from '../../store'
import { Clock } from 'lucide-react'
import { useContext } from 'react'

export default function TopStats() {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!
  const seconds = state.timerData.time % 60
  const minutes = Math.floor(state.timerData.time / 60)
  const secondsString = seconds < 10 ? '0' + seconds : seconds + ''
  const minutesString = minutes < 10 ? '0' + minutes : minutes + ''
  const correctCount = state.chapterData.correctCount

  return (
    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-1.5">
        <Clock size={16} className="text-gray-400" />
        <span className="font-mono tabular-nums">{`00:${minutesString}:${secondsString}`}</span>
      </div>
      <span className="font-semibold tabular-nums text-gray-700 dark:text-gray-200">{correctCount.toLocaleString()}</span>
    </div>
  )
}
