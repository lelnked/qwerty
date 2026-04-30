export interface CoursePackSummary {
  id: string
  title: string
  description: string
  cover: string
  isFree: boolean
}

export interface Course {
  id: string
  title: string
  description?: string
  dictId: string
  chapter: number
  coursePackId: string
}

export interface CoursePack extends CoursePackSummary {
  courses: Course[]
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export interface CoursePackProvider {
  fetchCoursePacks(): Promise<CoursePackSummary[]>
  fetchCoursePack(id: string): Promise<CoursePack>
  canAccess(pack: CoursePackSummary): boolean
}

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

async function readJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (res.status === 404) throw new NotFoundError(`Not found: ${path}`)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  return (await res.json()) as T
}

export class LocalJsonCoursePackProvider implements CoursePackProvider {
  async fetchCoursePacks(): Promise<CoursePackSummary[]> {
    const list = await readJson<CoursePackSummary[]>('/coursepacks/index.json')
    if (!Array.isArray(list)) throw new Error('Invalid course pack manifest')
    return list
  }

  async fetchCoursePack(id: string): Promise<CoursePack> {
    if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) {
      throw new NotFoundError(`Invalid course pack id: ${id}`)
    }
    const pack = await readJson<CoursePack>(`/coursepacks/${id}.json`)
    if (!pack || !Array.isArray(pack.courses)) {
      throw new Error('Invalid course pack detail')
    }
    pack.courses = pack.courses.map((c) => ({ ...c, coursePackId: c.coursePackId ?? pack.id }))
    return pack
  }

  canAccess(pack: CoursePackSummary): boolean {
    return pack.isFree === true
  }
}

export const coursePackProvider: CoursePackProvider = new LocalJsonCoursePackProvider()
