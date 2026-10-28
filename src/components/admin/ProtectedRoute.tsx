import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <p role="status" className="p-8 text-center">Đang kiểm tra phiên đăng nhập...</p>;

  const hasAdminRoleInArray = user?.roles?.some((r: { name: string }) => 
    r.name === "ADMIN" || r.name === "ROLE_ADMIN"
  );

  const hasAdminRoleName = user?.roleName === "ADMIN" || user?.roleName === "ROLE_ADMIN";

  const isAdmin = user && (hasAdminRoleInArray || hasAdminRoleName);

  if (!user || !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
