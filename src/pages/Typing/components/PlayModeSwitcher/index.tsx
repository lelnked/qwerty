import { isPlayModeAtom } from '@/store'
import { useAtom } from 'jotai'
import { PlayCircle } from 'lucide-react'

export default function PlayModeSwitcher() {
  const [isPlayMode, setIsPlayMode] = useAtom(isPlayModeAtom)

  return (
    <button
      type="button"
      onClick={(e) => {
        setIsPlayMode((v) => !v)
        e.currentTarget.blur()
      }}
      className={`p-[2px] text-lg focus:outline-none ${isPlayMode ? 'text-indigo-500' : 'text-gray-500'}`}
      aria-label="开关播放模式"
    >
      <PlayCircle size={20} />
    </button>
  )
}
