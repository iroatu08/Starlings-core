import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '../../components/admin/AdminSidebar'
import { AdminHeader } from '../../components/admin/AdminHeader'
import { AdminFooter } from '../../components/admin/AdminFooter'

export function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar isMobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-auto bg-slate-50/90">
          <div className="container-custom py-6 md:py-8">
            <Outlet />
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  )
}
