import type { CoursePack, CoursePackSummary } from '@/api/coursePackProvider'
import { atom } from 'jotai'

export const coursePacksAtom = atom<CoursePackSummary[]>([])
export const currentCoursePackAtom = atom<CoursePack | undefined>(undefined)
export const coursePackLoadingAtom = atom<boolean>(false)
export const loadCoursePackErrorAtom = atom<string | null>(null)
