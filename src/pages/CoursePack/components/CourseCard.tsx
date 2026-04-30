import type { Course } from '@/api/coursePackProvider'
import { CheckCircle2, PlayCircle } from 'lucide-react'
import type React from 'react'

interface Props {
  course: Course
  completionCount: number
  disabled?: boolean
  onClick: (course: Course) => void
}

const CourseCard: React.FC<Props> = ({ course, completionCount, disabled, onClick }) => {
  return (
    <button
      disabled={disabled}
      onClick={() => !disabled && onClick(course)}
      className={`group flex flex-col gap-3 rounded-2xl bg-white p-5 text-left shadow-sm transition-all dark:bg-gray-800 ${
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <h4 className="text-base font-bold text-gray-900 dark:text-white">{course.title}</h4>
        {disabled ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-300">
            暂不可用
          </span>
        ) : (
          <PlayCircle size={20} className="text-indigo-400 transition-transform group-hover:scale-110" />
        )}
      </div>
      {course.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{course.description}</p>
      )}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <CheckCircle2 size={14} />
        <span>已完成 {completionCount} 次</span>
      </div>
    </button>
  )
}

export default CourseCard
