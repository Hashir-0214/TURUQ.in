// src/components/admin/Sidebar.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Package,
  Presentation,
  MessageSquare,
  PenTool,
  Users,
  Mail,
  Settings,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, match: ['', 'index'] },
  { label: 'Posts', href: '/admin/posts', icon: FileText },
  { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { label: 'Packets', href: '/admin/packets', icon: Package },
  { label: 'Slides', href: '/admin/slides', icon: Presentation },
  { label: 'Comments', href: '/admin/comments', icon: MessageSquare },
  { label: 'Authors', href: '/admin/authors', icon: PenTool },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Subscription', href: '/admin/subscription', icon: Mail },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href, match) => {
    const clean = pathname.split('?')[0];          // remove querystring
    if (match) return match.some((m) => clean === `/admin/${m}` || clean === '/admin');
    return clean === href;
  };

  return (
    <aside className="sticky top-[120px] min-w-[250px] h-fit bg-[#ffedd9] border border-black rounded-[20px] py-4 flex flex-col mx-auto">
      {navItems.map((item, idx) => {
        const active = isActive(item.href, item.match);
        return (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 px-[34px] py-2 text-black no-underline font-medium text-[14px] transition-all duration-200 hover:bg-[#f2cfa6] ${
                active ? 'bg-[#f2cfa6]' : ''
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>

            {/* divider – skip after last item */}
            {idx < navItems.length - 1 && (
              <div className="w-[70%] h-px bg-black/50 mx-auto my-[5px]" />
            )}
          </div>
        );
      })}
    </aside>
  );
}