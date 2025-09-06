'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  BarChart,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Info,
  Tag,
} from 'lucide-react';
import { useAdminAuth } from '@/context/admin-auth-context';
import { hasPermission } from '@/lib/rbac';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { mockNotifications } from '@/lib/admin-data';
import Image from 'next/image';
import type { UserRole } from '@/types/admin';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { session, signOut } = useAdminAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hideNotifications = [
    '/admin',
    '/admin/orders',
    '/admin/products',
    '/admin/users',
    '/admin/promotions',
  ].includes(pathname as string);

  const user = session?.user;

  if (!user) {
    return null;
  }

  const unreadNotifications = mockNotifications.filter((n) => !n.read).length;

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === '/admin',
      permission: { resource: 'analytics', action: 'read' as const },
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      active: pathname === '/admin/users',
      permission: { resource: 'users', action: 'read' as const },
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: <ShoppingBag className="h-5 w-5" />,
      active: pathname === '/admin/products',
      permission: { resource: 'products', action: 'read' as const },
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: <FileText className="h-5 w-5" />,
      active: pathname === '/admin/orders',
      permission: { resource: 'orders', action: 'read' as const },
    },
    {
      name: 'Promotions',
      href: '/admin/promotions',
      icon: <Tag className="h-5 w-5" />,
      active: pathname.startsWith('/admin/promotions'),
      permission: { resource: 'promotions', action: 'read' as const },
    },
    {
      name: 'About',
      href: '/admin/about',
      icon: <Info className="h-5 w-5" />,
      active: pathname === '/admin/about',
      permission: { resource: 'settings', action: 'read' as const },
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      active: pathname === '/admin/settings',
      permission: { resource: 'settings', action: 'read' as const },
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    hasPermission(
      user.role as UserRole,
      item.permission.resource,
      item.permission.action
    )
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b">
            <Link href="/admin" className="flex items-center">
              <span className="text-xl font-bold">Lens Aura</span>
              <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                Admin
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      item.active
                        ? 'bg-gray-100 text-black font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage
                  src={user.avatar || '/placeholder.svg'}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            {/* Left: Welcome message with logo */}
            <div className="flex items-center space-x-3 min-w-0">
              <Image
                src="/images/lens-aura-logo.jpg"
                alt="Lens Aura Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
              <span className="font-semibold text-lg text-gray-800 truncate">
                Welcome Admin
              </span>
            </div>

            {/* Right: User dropdown always right-aligned */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Image
                      src="/images/lens-aura-logo.jpg"
                      alt="Lens Aura Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                      priority
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/admin/settings" className="flex w-full">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={signOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8 pt-header">{children}</main>
      </div>
    </div>
  );
}
