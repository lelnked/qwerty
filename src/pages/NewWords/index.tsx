import Layout from '@/components/Layout'
import { generateWordSoundSrc } from '@/hooks/usePronunciation'
import { pronunciationConfigAtom } from '@/store'
import { db } from '@/utils/db'
import { useLiveQuery } from 'dexie-react-hooks'
import Fuse from 'fuse.js'
import { useAtomValue } from 'jotai'
import { BookMarked, CheckCircle2, ExternalLink, Search, Trash2, Volume2 } from 'lucide-react'
import type React from 'react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

type Tab = 'newWords' | 'mastered'

const NewWordsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [tab, setTab] = useState<Tab>('newWords')
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)

  const newWords = useLiveQuery(() => db.newWords.orderBy('timeStamp').reverse().toArray()) || []
  const masteredWords = useLiveQuery(() => db.masteredWords.orderBy('timeStamp').reverse().toArray()) || []

  const words = tab === 'newWords' ? newWords : masteredWords

  const playPronunciation = (word: string) => {
    const src = generateWordSoundSrc(word, pronunciationConfig.type)
    if (src) {
      const audio = new Audio(src)
      audio.play()
    }
  }

  const deleteWord = async (id?: number) => {
    if (!id) return
    try {
      if (tab === 'newWords') {
        await db.newWords.delete(id)
        toast.success('已从生词本移除')
      } else {
        await db.masteredWords.delete(id)
        toast.success('已从掌握列表移除')
      }
    } catch (e) {
      console.error('删除失败', e)
      toast.error('删除失败')
    }
  }

  const fuse = useMemo(
    () =>
      new Fuse(words, {
        keys: ['word', 'meaning'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [words],
  )

  const filteredWords = searchTerm.trim() ? fuse.search(searchTerm).map((r) => r.item) : words

  const isMastered = tab === 'mastered'
  const title = isMastered ? '掌握列表' : '生词本'
  const subtitle = isMastered
    ? `已掌握的单词不会再出现在练习中 · 共 ${words.length} 条`
    : `记录你在练习中遇到的陌生单词 · 共 ${words.length} 条`

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 inline-flex rounded-2xl bg-black/5 p-1 dark:bg-white/5">
          <button
            type="button"
            onClick={() => {
              setTab('newWords')
              setSearchTerm('')
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              !isMastered
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-800 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <BookMarked size={16} />
            生词本
            <span className="ml-1 rounded-full bg-black/5 px-2 py-0.5 text-xs dark:bg-white/10">{newWords.length}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('mastered')
              setSearchTerm('')
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              isMastered
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-gray-800 dark:text-emerald-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <CheckCircle2 size={16} />
            掌握列表
            <span className="ml-1 rounded-full bg-black/5 px-2 py-0.5 text-xs dark:bg-white/10">{masteredWords.length}</span>
          </button>
        </div>

        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {subtitle}
              {searchTerm.trim() && words.length !== filteredWords.length && (
                <span className="ml-1">（命中 {filteredWords.length}）</span>
              )}
            </p>
            {isMastered && (
              <p className="mt-1 text-xs text-gray-400">练习中按 Ctrl+M 可将当前单词加入掌握列表</p>
            )}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={isMastered ? '搜索掌握的单词...' : '搜索生词...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-none bg-black/5 px-10 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-white/5 dark:text-white"
            />
          </div>
        </header>

        {filteredWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
              {isMastered ? (
                <CheckCircle2 size={40} className="text-gray-300" />
              ) : (
                <BookMarked size={40} className="text-gray-300" />
              )}
            </div>
            <p className="text-gray-500">
              {searchTerm.trim() ? '没有匹配的内容' : isMastered ? '还没有标记为已掌握的单词' : '还没有收藏过生词呢'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredWords.map((item) => (
              <div
                key={item.id}
                className="group relative flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3
                        className={`text-xl font-bold ${
                          isMastered ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {item.word}
                      </h3>
                      <span className="text-sm text-gray-400">/{item.pronunciation}/</span>
                      <button
                        onClick={() => playPronunciation(item.word)}
                        className="rounded-full p-1 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 dark:hover:bg-indigo-900/30"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">{item.meaning}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={`https://dictionary.cambridge.org/dictionary/english/${item.word}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-indigo-500 dark:bg-white/5"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button
                    onClick={() => deleteWord(item.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:bg-white/5"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default NewWordsPage
