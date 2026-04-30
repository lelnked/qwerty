import Footer from './Footer'
import Sidebar from './Sidebar'
import type React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-white transition-colors dark:bg-gray-900">
      <Sidebar />
      <main className="flex flex-1 flex-col items-center pb-4 lg:pl-[260px]">
        {children}
        <Footer />
      </main>
    </div>
  )
}
