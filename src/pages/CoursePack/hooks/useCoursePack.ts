import type { Course, CoursePackSummary } from '@/api/coursePackProvider'
import { coursePackProvider, NotFoundError } from '@/api/coursePackProvider'
import { dictionaries } from '@/resources/dictionary'
import { currentChapterAtom, currentDictIdAtom } from '@/store'
import { coursePackLoadingAtom, coursePacksAtom, currentCoursePackAtom, loadCoursePackErrorAtom } from '@/store/coursePack'
import { ActiveCourseMapEntry } from '@/utils/db/record'
import { db } from '@/utils/db'
import { useAtom, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const knownDictIds = new Set(dictionaries.map((d) => d.id))

export function isCourseAvailable(course: Course): boolean {
  return knownDictIds.has(course.dictId)
}

export function useCoursePackList() {
  const [coursePacks, setCoursePacks] = useAtom(coursePacksAtom)
  const [loading, setLoading] = useAtom(coursePackLoadingAtom)
  const [error, setError] = useAtom(loadCoursePackErrorAtom)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await coursePackProvider.fetchCoursePacks()
      setCoursePacks(res)
    } catch (e) {
      console.error('加载课程包列表失败', e)
      setError('加载课程包列表失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [setCoursePacks, setError, setLoading])

  useEffect(() => {
    if (coursePacks.length === 0) {
      void reload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { coursePacks, loading, error, reload }
}

export function useCoursePackDetail(id: string | undefined) {
  const [pack, setPack] = useAtom(currentCoursePackAtom)
  const [loading, setLoading] = useAtom(coursePackLoadingAtom)
  const [error, setError] = useAtom(loadCoursePackErrorAtom)

  const reload = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await coursePackProvider.fetchCoursePack(id)
      setPack(res)
    } catch (e) {
      if (e instanceof NotFoundError) {
        setError('课程包不存在')
      } else {
        console.error('加载课程包详情失败', e)
        setError('加载课程包详情失败，请重试')
      }
      setPack(undefined)
    } finally {
      setLoading(false)
    }
  }, [id, setError, setLoading, setPack])

  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return { pack, loading, error, reload }
}

export function useEnterCourse() {
  const navigate = useNavigate()
  const setCurrentDictId = useSetAtom(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)

  return useCallback(
    async (course: Course) => {
      if (!isCourseAvailable(course)) {
        toast.error('该课程对应的词库暂不可用')
        return
      }
      try {
        await db.activeCourseMap.put(
          new ActiveCourseMapEntry(course.coursePackId, course.id, course.dictId, course.chapter),
        )
      } catch (e) {
        console.error('保存当前课程失败', e)
      }
      setCurrentDictId(course.dictId)
      setCurrentChapter(course.chapter)
      navigate('/')
    },
    [navigate, setCurrentChapter, setCurrentDictId],
  )
}

export function useEnterPack() {
  const navigate = useNavigate()
  return useCallback(
    (pack: CoursePackSummary) => {
      if (!coursePackProvider.canAccess(pack)) {
        toast('该课程包需要会员权限', { icon: '🔒' })
        return
      }
      navigate(`/course-pack/${pack.id}`)
    },
    [navigate],
  )
}
