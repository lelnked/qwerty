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

  const playAudio = useCallback(
    (src: string) => {
      return new Promise<void>((resolve) => {
        if (!src) {
          resolve()
          return
        }
        // 释放上一个 audio 实例
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ''
          audioRef.current = null
        }
        // 不要设置 crossOrigin，否则有道发音会因 CORS 失败导致无声
        const audio = new Audio(src)
        audio.volume = pronunciationConfig.volume
        audio.playbackRate = pronunciationConfig.rate
        audio.preload = 'auto'
        audioRef.current = audio
        let done = false
        const finish = () => {
          if (done) return
          done = true
          audio.removeEventListener('ended', finish)
          audio.removeEventListener('error', finish)
          resolve()
        }
        audio.addEventListener('ended', finish)
        audio.addEventListener('error', finish)
        audio.play().catch(() => finish())
      })
    },
    [pronunciationConfig.volume, pronunciationConfig.rate],
  )

  // 单词或暂停状态变化时，重置并启动播放循环
  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    let cancelled = false
    let playedTimes = 0

    const wordSrc = generateWordSoundSrc(word.name, pronunciationConfig.type)
    const transSrc = playConfig.readTrans ? generateWordSoundSrc(word.trans.join('，'), 'zh') : ''

    const waitWhilePaused = async () => {
      while (!cancelled && isPausedRef.current) {
        await new Promise<void>((resolve) => {
          timerRef.current = window.setTimeout(resolve, 200)
        })
      }
    }

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timerRef.current = window.setTimeout(resolve, ms)
      })

    const cycle = async () => {
      // 按设置朗读 N 遍后再切下一个
      while (!cancelled && playedTimes < playConfig.repeatTimes) {
        await waitWhilePaused()
        if (cancelled) return

        await playAudio(wordSrc)
        if (cancelled) return

        if (playConfig.readTrans && transSrc) {
          await wait(300)
          if (cancelled) return
          await waitWhilePaused()
          if (cancelled) return
          await playAudio(transSrc)
          if (cancelled) return
        }

        playedTimes += 1

        if (playedTimes < playConfig.repeatTimes) {
          // 同一单词不同遍之间的小间隔
          await wait(Math.min(600, playConfig.intervalMs))
        }
      }
      if (cancelled) return
      // 全部遍数读完后等待间隔再切到下一个
      await wait(playConfig.intervalMs)
      if (cancelled) return
      onFinishRef.current()
    }

    cycle()

    return () => {
      cancelled = true
      clearTimer()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, [word, playConfig.intervalMs, playConfig.repeatTimes, playConfig.readTrans, pronunciationConfig.type, playAudio])

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
