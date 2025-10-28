"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "📊", short: "Dash" },
    { name: "Productos", href: "/admin/products", icon: "📦", short: "Prod" },
    { name: "Agregar Producto", href: "/admin/products/new", icon: "➕", short: "Nuevo" },
    { name: "Ventas", href: "/admin/orders", icon: "🛒", short: "Ventas" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg border-b sticky top-0 z-50 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🌸</span>
                <span className="font-bold text-gray-900 text-lg sm:text-xl">La Casita Admin</span>
              </div>
            </div>

            {/* Navigation Links - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2 xl:space-x-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 lg:px-4 xl:px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-pink-100 text-pink-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base lg:text-lg">{item.icon}</span>
                  <span className="hidden lg:inline xl:inline">{item.name}</span>
                  <span className="lg:hidden xl:hidden">{item.short}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-pink-100 text-pink-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  title={item.name}
                >
                  <span className="text-lg">{item.icon}</span>
                </Link>
              ))}
            </div>

            {/* Info Panel */}
            <div className="hidden xl:flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Sistema Activo</span>
              </div>
              <div className="border-l border-gray-200 h-4"></div>
              <div>
                {new Date().toLocaleDateString('es-MX', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="w-8 h-8 lg:w-9 lg:h-9 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {session?.user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32 xl:max-w-36">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
              </div>
              <div className="border-l border-gray-200 h-6 lg:h-8"></div>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
              >
                <span className="hidden lg:inline">Cerrar Sesión</span>
                <span className="lg:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content - Full width and height */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}