import { generateWordSoundSrc } from '@/hooks/usePronunciation'
import { isPlayModeAtom, playModeConfigAtom, pronunciationConfigAtom } from '@/store'
import type { Word } from '@/typings'
import { useAtomValue, useSetAtom } from 'jotai'
import { Pause, Play, SkipForward } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  word: Word
  onFinish: () => void
}

export default function PlayWord({ word, onFinish }: Props) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const playConfig = useAtomValue(playModeConfigAtom)
  const setIsPlayMode = useSetAtom(isPlayModeAtom)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<number | null>(null)
  const playedTimesRef = useRef(0)
  const isPausedRef = useRef(false)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  const [isPaused, setIsPaused] = useState(false)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const playAudio = useCallback((src: string) => {
    return new Promise<void>((resolve) => {
      if (!src) {
        resolve()
        return
      }
      const audio = new Audio(src)
      audio.crossOrigin = 'anonymous'
      audio.volume = pronunciationConfig.volume
      audio.playbackRate = pronunciationConfig.rate
      audioRef.current = audio
      const onEnd = () => {
        audio.removeEventListener('ended', onEnd)
        audio.removeEventListener('error', onErr)
        resolve()
      }
      const onErr = () => {
        audio.removeEventListener('ended', onEnd)
        audio.removeEventListener('error', onErr)
        resolve()
      }
      audio.addEventListener('ended', onEnd)
      audio.addEventListener('error', onErr)
      audio.play().catch(() => resolve())
    })
  }, [pronunciationConfig.volume, pronunciationConfig.rate])

  // 单词或暂停状态变化时，重置并启动播放循环
  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    let cancelled = false
    playedTimesRef.current = 0

    const wordSrc = generateWordSoundSrc(word.name, pronunciationConfig.type)
    const transSrc = playConfig.readTrans ? generateWordSoundSrc(word.trans.join('，'), 'zh') : ''

    const cycle = async () => {
      while (!cancelled) {
        if (isPausedRef.current) {
          await new Promise<void>((resolve) => {
            const check = () => {
              if (cancelled || !isPausedRef.current) {
                resolve()
              } else {
                timerRef.current = window.setTimeout(check, 200)
              }
            }
            check()
          })
          if (cancelled) return
        }

        await playAudio(wordSrc)
        if (cancelled) return

        if (playConfig.readTrans && transSrc) {
          await new Promise<void>((resolve) => {
            timerRef.current = window.setTimeout(resolve, 300)
          })
          if (cancelled) return
          await playAudio(transSrc)
          if (cancelled) return
        }

        playedTimesRef.current += 1
        if (playedTimesRef.current >= playConfig.repeatTimes) {
          // 等待间隔后切到下一个
          await new Promise<void>((resolve) => {
            timerRef.current = window.setTimeout(resolve, playConfig.intervalMs)
          })
          if (cancelled) return
          onFinishRef.current()
          return
        } else {
          // 同一个单词内重复之间的小间隔
          await new Promise<void>((resolve) => {
            timerRef.current = window.setTimeout(resolve, Math.min(600, playConfig.intervalMs))
          })
        }
      }
    }

    cycle()

    return () => {
      cancelled = true
      clearTimer()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [word, playConfig.intervalMs, playConfig.repeatTimes, playConfig.readTrans, pronunciationConfig.type, playAudio])

  const togglePause = () => {
    setIsPaused((p) => {
      const next = !p
      if (next) {
        audioRef.current?.pause()
      } else {
        audioRef.current?.play().catch(() => undefined)
      }
      return next
    })
  }

  const skipNow = () => {
    clearTimer()
    audioRef.current?.pause()
    onFinishRef.current()
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="select-text font-mono text-6xl font-normal tracking-wider text-indigo-500 dark:text-indigo-400">
        {word.name}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePause}
          className="flex items-center gap-1 rounded-full bg-indigo-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-600"
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
          {isPaused ? '继续' : '暂停'}
        </button>
        <button
          type="button"
          onClick={skipNow}
          className="flex items-center gap-1 rounded-full bg-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
        >
          <SkipForward size={16} />
          下一个
        </button>
        <button
          type="button"
          onClick={() => setIsPlayMode(false)}
          className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          退出播放
        </button>
      </div>
    </div>
  )
}
