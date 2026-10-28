import SearchForm from "@/components/SearchForm";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import LegacySidebar from "@/components/layout/LegacySidebar";
import SensitiveImage from "@/components/SensitiveImage";
import { useAuth } from "@/contexts/AuthContext";
import ContentPageLayout, {
  ContentPageTitle,
} from "@/components/layout/ContentPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import ContentPageHeading from "@/components/layout/ContentPageHeading";

export default function UniformPage() {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    adminApi
      .getAllUniforms()
      .then(setItems)
      .catch(() => setItems([]));
  }, [isAuthenticated]);

  const filtered = items.filter(
    (item) => item.category?.categoryType === "UNIFORM",
  );

  return (
    <ContentPageLayout sidebar={<LegacySidebar />}>
      <ContentPageHeading
        title={language === "en" ? "Uniforms" : "Quân trang"}
        trail={
          language === "en" ? "Resources / Uniforms" : "Tài liệu / Quân trang"
        }
      />
      <div className="mb-6">
        <SearchForm type="uniform" />
      </div>
      {filtered.length ? (
        <div className="space-y-6">
          {filtered.map((item) => {
            const image = item.images?.[0];
            return (
              <Link
                key={item.id}
                to={`/tai-lieu/quan-trang/${item.id}`}
                className="group grid gap-5 border-b border-[#ddd] pb-6 md:grid-cols-[220px_1fr]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#f1f1f1]">
                  {image?.imageUrl || image?.sensitive ? (
                    <SensitiveImage
                      src={image.imageUrl || undefined}
                      sensitive={Boolean(image.sensitive)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl text-[#ccc]">
                      ▧
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold uppercase leading-tight group-hover:text-[#b51f24]">
                    {item.name}
                  </h2>
                  <p className="mt-2 text-[16px] leading-6 text-[#555]">
                    {item.description ||
                      (language === "en"
                        ? "Content is being prepared..."
                        : "Nội dung đang được cập nhật...")}
                  </p>
                  <span className="mt-3 inline-block text-[#b51f24]">
                    {language === "en" ? "View details" : "Xem chi tiết"} ›
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="py-16 text-center text-[#777]">
          {language === "en"
            ? "No uniforms found."
            : "Chưa có dữ liệu quân trang."}
        </p>
      )}
    </ContentPageLayout>
  );
}
