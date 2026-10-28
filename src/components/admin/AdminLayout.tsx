// src/components/admin/AdminLayout.tsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  return (
    <div className="min-h-screen bg-white font-body">
      {menuOpen && <button type="button" aria-label="Đóng menu quản trị" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden" />}
      <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-h-screen min-w-0 bg-white lg:ml-64 lg:p-4">
        <div className="sticky top-0 z-30 flex items-center justify-between bg-[#292929] px-4 py-3 text-white lg:hidden">
          <span className="font-bold">Quản trị A509</span>
          <button type="button" aria-label={menuOpen ? "Đóng menu quản trị" : "Mở menu quản trị"} aria-controls="admin-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)} className="rounded border border-white/30 p-2">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
