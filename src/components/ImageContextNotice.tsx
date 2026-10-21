import { useEffect, useRef, useState } from "react";

const NOTICE_KEY = "a509.image-context-notice-shown";

/**
 * Shows the image-use notice on the first image context-menu attempt only.
 * After that first acknowledgement, the browser context menu works normally.
 */
export default function ImageContextNotice() {
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const noticeShown = useRef(false);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target;
      const image = target instanceof Element ? target.closest("img") : null;
      if (!image) return;
      if (noticeShown.current) return;

      try {
        if (window.localStorage.getItem(NOTICE_KEY) === "1") {
          noticeShown.current = true;
          return;
        }
      } catch {
        // The ref still limits the notice to once for this page load.
      }

      // Do not cancel the native context menu: users can still save the image.
      noticeShown.current = true;
      try {
        window.localStorage.setItem(NOTICE_KEY, "1");
      } catch {
        // The notice still works when browser storage is blocked.
      }

      setVisible(true);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), 5000);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-[100] w-[min(92vw,34rem)] -translate-x-1/2 rounded-xl border border-brand-red/20 bg-white px-5 py-4 text-sm text-brand-text shadow-2xl"
    >
      <p className="font-bold text-brand-redDark">Lưu ý khi sử dụng hình ảnh</p>
      <p className="mt-1 leading-5">
        Vui lòng ghi nguồn và tôn trọng bản quyền khi lưu hoặc sử dụng lại ảnh.
      </p>
    </div>
  );
}
