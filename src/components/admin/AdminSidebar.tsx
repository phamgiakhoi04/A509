// src/components/admin/AdminSidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Shirt, FileText, LayoutList, Newspaper, Users, Home, X } from "lucide-react";

export default function AdminSidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const adminMenuItems = [
    { path: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { path: "/admin/phuc-dung", label: "Quản lý Phục Dựng", icon: LayoutList },
    { path: "/admin/quan-trang", label: "Quản lý Quân trang", icon: Shirt },
    { path: "/admin/tai-lieu", label: "Quản lý Tài liệu", icon: FileText },
    { path: "/admin/tin-tuc", label: "Quản lý Tin tức", icon: Newspaper },
    { path: "/admin/users", label: "Quản lý Người dùng", icon: Users },
  ];

  return (
    <aside id="admin-navigation" aria-label="Điều hướng quản trị" className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto border-r-4 border-brand-red bg-[#292929] text-white shadow-xl transition-transform lg:visible lg:translate-x-0 ${open ? "visible translate-x-0" : "invisible -translate-x-full"}`}>
      <button type="button" aria-label="Đóng menu quản trị" onClick={onClose} className="absolute right-2 top-2 rounded bg-[#292929] p-2 lg:hidden"><X size={20} /></button>
      <Link 
        to="/admin/dashboard"
        onClick={onClose}
        className="h-20 flex items-center justify-center border-b border-white/10 hover:bg-[#444] transition-colors"
      >
          <div className="h-14 w-52 bg-[#1f1f1f] border-b-4 border-brand-yellow overflow-hidden flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
          <img
            src={`${import.meta.env.BASE_URL}images/A509 Research & Reenactment Group.png`}
            alt="A509 Logo"
            className="w-48 h-14 object-contain"
          />
        </div>
      </Link>
      
      <nav className="flex-1 p-4 space-y-1">
        {adminMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-bold text-sm whitespace-nowrap ${
              isActive(item.path)
                  ? "bg-[#444] text-[#f5c400] border-l-4 border-brand-red"
                : "text-white/90 hover:bg-[#444] hover:text-[#f5c400]"
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-brand-red">
        <Link 
          to="/"
          onClick={onClose}
          className="flex items-center gap-2 text-white/80 hover:text-brand-red transition-colors font-medium"
        >
          <Home size={18} /> Về trang chủ
        </Link>
      </div>
    </aside>
  );
}
