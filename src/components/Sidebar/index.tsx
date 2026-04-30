import { infoPanelStateAtom, isOpenDarkModeAtom } from '@/store'
import { useAtom, useSetAtom } from 'jotai'
import { BarChart3, BookMarked, Bookmark, Coffee, Keyboard, Library, Link2, MessageSquare, Moon, Sun } from 'lucide-react'
import type React from 'react'
import { useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import IconXiaoHongShu from '~icons/my-icons/xiaohongshu'
import IconGithub from '~icons/simple-icons/github'
import IconWechat2 from '~icons/simple-icons/wechat'

const menuItems = [
  { icon: Keyboard, label: '单词练习', path: '/' },
  { icon: Bookmark, label: '生词本', path: '/new-words' },
  { icon: Library, label: '词库选择', path: '/gallery' },
  { icon: BarChart3, label: '学习统计', path: '/analysis' },
  { icon: BookMarked, label: '错题本', path: '/error-book' },
  { icon: Link2, label: '友情链接', path: '/friend-links' },
]

const Sidebar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useAtom(isOpenDarkModeAtom)
  const setInfoPanelState = useSetAtom(infoPanelStateAtom)

  const handleOpenInfoPanel = useCallback(
    (modalType: string) => {
      setInfoPanelState((state: any) => ({ ...state, [modalType]: true }))
    },
    [setInfoPanelState],
  )

  return (
    <aside className="fixed left-0 top-0 z-[200] flex hidden h-full w-[260px] flex-col border-r border-gray-200/50 bg-white/80 backdrop-blur-xl transition-all dark:border-gray-800/50 dark:bg-gray-900/80 lg:flex">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
            onClick={() => navigate('/')}
          >
            <Keyboard size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Qwerty</span>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-black/5 active:scale-95 dark:hover:bg-white/5"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} className="text-gray-400" /> : <Moon size={20} className="text-gray-500" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2">
        <div className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} className="no-underline">
                <button
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                    isActive
                      ? 'bg-black/5 font-bold text-black dark:bg-white/10 dark:text-white'
                      : 'text-gray-500 hover:bg-black/[0.03] dark:text-gray-400 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-500' : ''} />
                  <span className="text-[15px]">{item.label}</span>
                </button>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 px-2">
          <div className="rounded-2xl border border-gray-100 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
                <Coffee size={18} />
              </div>
              <div>
                <div className="text-[12px] font-bold text-gray-900 dark:text-white">支持我们</div>
                <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500">定制贴纸周边</div>
              </div>
            </div>
            <button
              onClick={() => handleOpenInfoPanel('donate')}
              className="mt-3 w-full rounded-xl bg-black/5 py-2 text-[12px] font-bold text-gray-600 transition-all hover:bg-black/10 active:scale-[0.98] dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              了解详情
            </button>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="mb-4 flex items-center justify-center gap-4 border-b border-gray-100 pb-4 dark:border-white/5">
          <a
            href="https://github.com/Kaiyiwing/qwerty-learner"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 transition-colors hover:text-black dark:hover:text-white"
          >
            <IconGithub size={18} />
          </a>
          <button onClick={() => handleOpenInfoPanel('community')} className="text-gray-400 transition-colors hover:text-green-500">
            <IconWechat2 size={18} />
          </button>
          <button onClick={() => handleOpenInfoPanel('redBook')} className="text-gray-400 transition-colors hover:text-red-500">
            <IconXiaoHongShu size={18} />
          </button>
          <button onClick={() => handleOpenInfoPanel('community')} className="text-gray-400 transition-colors hover:text-indigo-500">
            <MessageSquare size={18} />
          </button>
        </div>
        <div className="text-center">
          <span className="text-[11px] font-medium uppercase tracking-widest text-gray-300 dark:text-gray-600">Build v1.0.0</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
