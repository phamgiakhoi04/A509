import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { adminApi } from "@/api/adminApi";
import type { User } from "@/types/models";
import { apiError } from "@/utils/apiError";

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try { setUsers(await adminApi.getAllUsers()); }
    catch (err: any) { setError(apiError(err, "Không thể tải người dùng.")); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (user: User) => {
    if (!window.confirm(`${user.status ? "Khóa" : "Mở khóa"} tài khoản ${user.username}?`)) return;
    try { await adminApi.setUserStatus(user.id, !user.status); await load(); }
    catch (err: any) { setError(apiError(err, "Không thể cập nhật trạng thái.")); }
  };

  return <div className="admin-page space-y-6 p-8 font-body">
    <h1 className="font-display text-4xl font-black uppercase text-brand-redDark">Quản lý người dùng</h1>
    {error && <div className="rounded-xl border-l-4 border-brand-red bg-red-50 p-4 font-bold text-brand-redDark">{error}</div>}
    <div className="overflow-hidden rounded-2xl border border-brand-red/10 bg-white shadow-pop">
      {loading ? <div className="flex justify-center p-16"><Loader2 className="animate-spin text-brand-red" /></div> : <div className="divide-y divide-gray-100">{users.map((user) => <div key={user.id} className="flex items-center justify-between gap-4 p-5"><div><p className="font-bold text-brand-text">{user.fullName || user.username}</p><p className="text-sm text-gray-500">@{user.username} · {user.email} · {user.roleName}</p></div><button onClick={() => toggle(user)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${user.status ? "text-red-700 hover:bg-red-50" : "text-green-700 hover:bg-green-50"}`}>{user.status ? <ShieldOff size={18} /> : <ShieldCheck size={18} />}{user.status ? "Khóa" : "Mở khóa"}</button></div>)}{!users.length && <p className="p-12 text-center text-gray-500">Chưa có người dùng.</p>}</div>}
    </div>
  </div>;
}
