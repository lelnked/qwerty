import { db } from '@/utils/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'

/**
 * 返回当前 dict 下已加入生词本的单词集合（小写）。
 * 在 Typing 章节装载时用于跳过这些单词。
 */
export function useSkipMasteredWord(dictId: string): Set<string> {
  const records = useLiveQuery(
    () => (dictId ? db.newWords.where('dictId').equals(dictId).toArray() : Promise.resolve([])),
    [dictId],
    [],
  )
  return useMemo(() => new Set((records ?? []).map((r) => r.word.toLowerCase())), [records])
}
