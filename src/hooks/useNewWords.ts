import { currentDictIdAtom } from '@/store'
import type { Word } from '@/typings'
import { db } from '@/utils/db'
import { NewWord } from '@/utils/db/record'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

export function useNewWords() {
  const dictId = useAtomValue(currentDictIdAtom)

  const addNewWord = useCallback(
    async (word: Word) => {
      try {
        const exists = await db.newWords.where('word').equalsIgnoreCase(word.name).first()
        if (exists) {
          toast('该单词已在生词本中', { icon: '📖' })
          return
        }

        const newWordEntry = new NewWord(word.name, dictId, word.trans.join('；'), word.usphone || word.ukphone || '')

        await db.newWords.add(newWordEntry)
        toast.success(`已加入生词本: ${word.name}`)
      } catch (error) {
        console.error('加入生词本失败', error)
        toast.error('操作失败')
      }
    },
    [dictId],
  )

  const removeNewWord = useCallback(async (wordName: string) => {
    try {
      await db.newWords.where('word').equalsIgnoreCase(wordName).delete()
      toast.success('已从生词本移除')
    } catch (error) {
      console.error('移除生词失败', error)
    }
  }, [])

  return { addNewWord, removeNewWord }
}
