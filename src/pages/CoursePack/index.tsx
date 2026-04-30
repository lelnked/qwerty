import CoursePackCard from './components/CoursePackCard'
import { useCoursePackList, useEnterPack } from './hooks/useCoursePack'
import Layout from '@/components/Layout'
import Loading from '@/components/Loading'
import { GraduationCap } from 'lucide-react'
import type React from 'react'

const CoursePackListPage: React.FC = () => {
  const { coursePacks, loading, error, reload } = useCoursePackList()
  const enterPack = useEnterPack()

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">我的课程包</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">挑选一个课程包，按章节顺序练习。</p>
        </header>

        {loading && <Loading />}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="mb-4 text-gray-500">{error}</p>
            <button
              onClick={() => void reload()}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-600"
            >
              重试
            </button>
          </div>
        )}

        {!loading && !error && coursePacks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
              <GraduationCap size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-500">还没有课程包</p>
          </div>
        )}

        {!loading && !error && coursePacks.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {coursePacks.map((pack) => (
              <CoursePackCard key={pack.id} pack={pack} onClick={enterPack} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CoursePackListPage
