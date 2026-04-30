import CourseCard from './components/CourseCard'
import { isCourseAvailable, useCoursePackDetail, useEnterCourse } from './hooks/useCoursePack'
import Layout from '@/components/Layout'
import Loading from '@/components/Loading'
import { db } from '@/utils/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft } from 'lucide-react'
import type React from 'react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const CoursePackDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { pack, loading, error, reload } = useCoursePackDetail(id)
  const enterCourse = useEnterCourse()

  const queryKey = useMemo(() => pack?.courses.map((c) => `${c.dictId}:${c.chapter}`).join('|') ?? '', [pack])
  const completionMap = useLiveQuery(
    async () => {
      if (!pack) return new Map<string, number>()
      const map = new Map<string, number>()
      for (const c of pack.courses) {
        const count = await db.chapterRecords.where({ dict: c.dictId, chapter: c.chapter }).count()
        map.set(c.id, count)
      }
      return map
    },
    [queryKey],
    new Map<string, number>(),
  )

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-6 py-10">
        <button
          onClick={() => navigate('/course-pack')}
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-500"
        >
          <ChevronLeft size={16} /> 返回课程包列表
        </button>

        {loading && <Loading />}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="mb-4 text-gray-500">{error}</p>
            <div className="flex gap-2">
              <button
                onClick={() => void reload()}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-600"
              >
                重试
              </button>
              <button
                onClick={() => navigate('/course-pack')}
                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
              >
                返回列表
              </button>
            </div>
          </div>
        )}

        {!loading && !error && pack && (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{pack.title}</h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{pack.description}</p>
            </header>

            {pack.courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-gray-500">该课程包暂无课程</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {pack.courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    completionCount={completionMap?.get(course.id) ?? 0}
                    disabled={!isCourseAvailable(course)}
                    onClick={enterCourse}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default CoursePackDetailPage
