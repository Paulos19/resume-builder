'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FilePlus } from 'lucide-react';

const links = [
  { href: '/dashboard', icon: Home, label: 'Painel' },
  { href: '/resume-builder', icon: FilePlus, label: 'Novo Currículo' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-card p-4">
      <div className="flex items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Lovable</h1>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith(link.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
