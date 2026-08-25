'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const items = [
    ['/dashboard', '📊', 'Overview'],
    ['/resumes', '📄', 'Resumes'],
    ['/report', '📈', 'Reports'],
    ['/editor', '✍️', 'Builder'],
    ['/skills', '🧠', 'Skills'],
    ['/templates', '🎨', 'Templates'],
    ['/company-match', '🎯', 'Company Match'],
    ['/history', '🕒', 'History'],
    ['/settings', '⚙️', 'Settings'],
  ]

  return (
    <aside className="sidebar glass-panel">
      {items.map(([href, icon, label]) => (
        <Link
          key={href}
          href={href}
          className={`sidebar-link ${
            pathname === href ? 'active' : ''
          }`}
        >
          <span>{icon}</span>
          {label}
        </Link>
      ))}
    </aside>
  )
}