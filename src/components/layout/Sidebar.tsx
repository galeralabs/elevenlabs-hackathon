import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  UserRound,
  Phone,
  AlertCircle,
  SmilePlus,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Actions', href: '/actions', icon: AlertCircle },
  { name: 'Elderly', href: '/elderly', icon: UserRound },
  { name: 'Calls', href: '/calls', icon: Phone },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-sidebar-background">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <SmilePlus className="h-6 w-6 text-primary" />
        <span className="text-xl font-semibold">Teatime</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          TeaTime v0.1.0
        </p>
      </div>
    </aside>
  )
}
