import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell flex flex-col md:flex-row min-h-screen bg-background-light">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col w-full min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-3 pb-6 pt-24 sm:px-4 sm:pt-28 lg:px-6 lg:pb-8">
          <div className="page-shell">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default Layout
