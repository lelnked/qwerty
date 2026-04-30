import { generateWordSoundSrc } from '@/hooks/usePronunciation'
import { isPlayModeAtom, playModeConfigAtom, pronunciationConfigAtom } from '@/store'
import type { Word } from '@/typings'
import { useAtomValue, useSetAtom } from 'jotai'
import { Pause, Play, SkipForward } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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
  const isPausedRef = useRef(false)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  // 把最新配置写入 ref，避免它们的变化触发 cycle 重启而打断当前播放
  const volumeRef = useRef(pronunciationConfig.volume)
  const rateRef = useRef(pronunciationConfig.rate)
  const repeatTimesRef = useRef(playConfig.repeatTimes)
  const intervalMsRef = useRef(playConfig.intervalMs)
  volumeRef.current = pronunciationConfig.volume
  rateRef.current = pronunciationConfig.rate
  repeatTimesRef.current = playConfig.repeatTimes
  intervalMsRef.current = playConfig.intervalMs

  const [isPaused, setIsPaused] = useState(false)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    let cancelled = false
    let playedTimes = 0

    const wordSrc = generateWordSoundSrc(word.name, pronunciationConfig.type)

    const playOnce = (src: string) =>
      new Promise<void>((resolve) => {
        if (!src) {
          resolve()
          return
        }
        // 不要设置 crossOrigin，否则有道发音会因 CORS 失败导致无声
        const audio = new Audio(src)
        audio.volume = volumeRef.current
        audio.playbackRate = rateRef.current
        audio.preload = 'auto'
        audioRef.current = audio
        let done = false
        const finish = () => {
          if (done) return
          done = true
          audio.removeEventListener('ended', onEnd)
          audio.removeEventListener('error', onErr)
          resolve()
        }
        const onEnd = () => finish()
        const onErr = () => finish()
        audio.addEventListener('ended', onEnd)
        audio.addEventListener('error', onErr)
        audio.play().catch(() => finish())
      })

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timerRef.current = window.setTimeout(resolve, ms)
      })

    const waitWhilePaused = async () => {
      while (!cancelled && isPausedRef.current) {
        await wait(200)
      }
    }

    const cycle = async () => {
      while (!cancelled && playedTimes < repeatTimesRef.current) {
        await waitWhilePaused()
        if (cancelled) return

        await playOnce(wordSrc)
        if (cancelled) return

        playedTimes += 1

        if (playedTimes < repeatTimesRef.current) {
          // 同一单词不同遍之间的小间隔
          await wait(Math.min(600, intervalMsRef.current))
          if (cancelled) return
        }
      }
      if (cancelled) return
      // 全部遍数读完后等待间隔再切到下一个
      await wait(intervalMsRef.current)
      if (cancelled) return
      onFinishRef.current()
    }

    cycle()

    return () => {
      cancelled = true
      clearTimer()
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.src = ''
        audioRef.current = null
      }
    }
  }, [word, pronunciationConfig.type])

  const togglePause = () => {
    setIsPaused((p) => {
      const next = !p
      isPausedRef.current = next
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
