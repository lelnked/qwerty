import { currentDictIdAtom } from '@/store'
import type { Word } from '@/typings'
import { db } from '@/utils/db'
import { MasteredWord } from '@/utils/db/record'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'

export function useMasteredWords() {
  const dictId = useAtomValue(currentDictIdAtom)

  const addMasteredWord = useCallback(
    async (word: Word) => {
      try {
        const exists = await db.masteredWords.where('word').equalsIgnoreCase(word.name).first()
        if (exists) {
          toast('该单词已在掌握列表中', { icon: '✅' })
          return
        }

        const entry = new MasteredWord(word.name, dictId, word.trans.join('；'), word.usphone || word.ukphone || '')

        await db.masteredWords.add(entry)
        // 同时把它从生词本里移除（如果存在），避免两边都有
        await db.newWords.where('word').equalsIgnoreCase(word.name).delete()
        toast.success(`已加入掌握列表: ${word.name}`)
      } catch (error) {
        console.error('加入掌握列表失败', error)
        toast.error('操作失败')
      }
    },
    [dictId],
  )

  const removeMasteredWord = useCallback(async (wordName: string) => {
    try {
      await db.masteredWords.where('word').equalsIgnoreCase(wordName).delete()
      toast.success('已从掌握列表移除')
    } catch (error) {
      console.error('移除掌握单词失败', error)
    }
  }, [])

  return { addMasteredWord, removeMasteredWord }
}

/**
 * 当前 dict 下的"已掌握"单词集合（小写）。在 Typing 章节装载时用于跳过这些单词。
 */
export function useMasteredWordsSet(dictId: string): Set<string> {
  const records = useLiveQuery(
    () => (dictId ? db.masteredWords.where('dictId').equals(dictId).toArray() : Promise.resolve([])),
    [dictId],
    [],
  )
  return useMemo(() => new Set((records ?? []).map((r) => r.word.toLowerCase())), [records])
}
