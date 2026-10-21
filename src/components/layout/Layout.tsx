import { useEffect, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AuthModal, { type AuthView } from "@/components/auth/AuthModal";

export default function Layout() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialView, setAuthInitialView] = useState<AuthView>("REGISTER");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const openRegisterModal = () => {
      setAuthInitialView("REGISTER");
      setShowAuthModal(true);
    };
    const openForgotPasswordModal = () => {
      setAuthInitialView("FORGOT");
      setShowAuthModal(true);
    };
    const openLoginModal = () => {
      setAuthInitialView("LOGIN");
      setShowAuthModal(true);
    };
    window.addEventListener("openRegisterModal", openRegisterModal);
    window.addEventListener("openForgotPasswordModal", openForgotPasswordModal);
    window.addEventListener("openLoginModal", openLoginModal);
    return () => {
      window.removeEventListener("openRegisterModal", openRegisterModal);
      window.removeEventListener("openForgotPasswordModal", openForgotPasswordModal);
      window.removeEventListener("openLoginModal", openLoginModal);
    };
  }, []);

  // Password-reset links render the normal homepage shell and open the form
  // in the same modal as register/forgot-password instead of a separate page.
  useEffect(() => {
    const token = searchParams.get("token") || searchParams.get("resetToken");
    if (token && (location.pathname === "/reset-password" || location.pathname === "/")) {
      setResetToken(token);
      setAuthInitialView("RESET");
      setShowAuthModal(true);
    }
  }, [location.pathname, searchParams]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#222]">
      {/* NOTE:
          Khung website chính.
          max-w-[900px] = chiều rộng gần với layout mẫu A509.
          bg-white = phần nội dung website màu trắng.
          shadow = tạo cảm giác website nổi trên nền kem.
      */}
      <div className="mx-auto min-h-screen w-full max-w-[900px] bg-white shadow-sm">
        <Header />

        {/* NOTE:
            Nội dung các page nằm ở đây thông qua React Router Outlet.
        */}
        <main className="min-h-[500px]">
          <Outlet />
        </main>

        <Footer />
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialView={authInitialView}
          resetToken={resetToken}
        />
      )}
    </div>
  );
}
