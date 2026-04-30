import Layout from '@/components/Layout'
import { generateWordSoundSrc } from '@/hooks/usePronunciation'
import { pronunciationConfigAtom } from '@/store'
import { db } from '@/utils/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAtomValue } from 'jotai'
import { Trash2, Volume2, Search, ExternalLink, BookMarked } from 'lucide-react'
import React, { useState } from 'react'

const NewWordsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)

  // 使用 useLiveQuery 实时同步数据库状态
  const words = useLiveQuery(() => db.newWords.orderBy('timeStamp').reverse().toArray()) || []

  const playPronunciation = (word: string) => {
    const src = generateWordSoundSrc(word, pronunciationConfig.type)
    if (src) {
      const audio = new Audio(src)
      audio.play()
    }
  }

  const deleteWord = async (id?: number) => {
    if (id) {
      await db.newWords.delete(id)
    }
  }

  const filteredWords = words.filter(
    (w) => w.word.toLowerCase().includes(searchTerm.toLowerCase()) || w.meaning.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-6 py-10">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">生词本</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">记录你在练习中遇到的陌生单词</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索生词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-none bg-black/5 px-10 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-white/5 dark:text-white"
            />
          </div>
        </header>

        {filteredWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
              <BookMarked size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-500">还没有收藏过生词呢</p>
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
                      <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{item.word}</h3>
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
