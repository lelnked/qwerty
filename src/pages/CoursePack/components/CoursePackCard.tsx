import type { CoursePackSummary } from '@/api/coursePackProvider'
import { GraduationCap, Lock } from 'lucide-react'
import type React from 'react'

interface Props {
  pack: CoursePackSummary
  onClick: (pack: CoursePackSummary) => void
}

const CoursePackCard: React.FC<Props> = ({ pack, onClick }) => {
  return (
    <button
      onClick={() => onClick(pack)}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-gray-800"
    >
      <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
        {pack.cover ? (
          <img
            src={pack.cover}
            alt={pack.title}
            className="h-full w-full object-cover"
            onError={(e) => ((e.currentTarget.style.display = 'none'))}
          />
        ) : (
          <GraduationCap size={48} className="opacity-80" />
        )}
        {!pack.isFree && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[11px] font-bold text-white">
            <Lock size={12} /> 会员
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">{pack.title}</h3>
        <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{pack.description}</p>
      </div>
    </button>
  )
}

export default CoursePackCard
