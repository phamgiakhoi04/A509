import TranslationNotice from "@/components/TranslationNotice";
import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { articleApi } from "@/api/articleApi";
import { Loader2, Calendar, MapPin } from "lucide-react";
import CommentSection from "@/components/CommentSection";
import SensitiveImage from "@/components/SensitiveImage";
import ContentPageHeading from "@/components/layout/ContentPageHeading";
import { useAuth } from "@/contexts/AuthContext";
import ContentPageLayout from "@/components/layout/ContentPageLayout";

export default function UniformDetailPage() {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [referenceImages, setReferenceImages] = useState<
    {
      id: number;
      imageUrl: string | null;
      description?: string;
      sensitive?: boolean;
    }[]
  >([]);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id, isAuthenticated]);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [data, references] = await Promise.all([
        adminApi.getUniformById(Number(id)),
        articleApi.getReferenceImages(Number(id)).catch(() => []),
      ]);
      if (data && data.id) {
        setItem(data);
        setReferenceImages(references);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết quân trang:", error);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ContentPageLayout className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            className="animate-spin text-brand-red mx-auto mb-4"
            size={48}
          />
          <p className="font-display text-2xl text-brand-text/70">
            {uiText("Đang tải...")}
          </p>
        </div>
      </ContentPageLayout>
    );
  }

  if (!item) {
    return (
      <ContentPageLayout className="flex min-h-[55vh] items-center justify-center text-center">
        <div>
          <p className="font-display text-3xl text-brand-text/50 mb-6">
            {uiText("Không tìm thấy quân trang")}
          </p>
          <Link
            to="/quan-trang"
            className="inline-block px-6 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-brand-redDark transition-all"
          >
            {uiText("← Quay lại danh sách")}{" "}
          </Link>
        </div>
      </ContentPageLayout>
    );
  }

  return (
    <ContentPageLayout className="min-h-[55vh]">
      <section className="border-b border-[#ddd] pb-6">
        <div className="mx-auto w-full max-w-5xl">
          <ContentPageHeading
            title={item.name}
            trail={uiText("Tài liệu / Quân trang")}
          />
          <TranslationNotice status={item.translationStatus} />
          {item.country?.countryName && (
            <div className="mt-4 inline-block border-l-4 border-brand-red bg-[#f1f1f1] px-3 py-2 text-sm font-bold uppercase tracking-wide text-brand-redDark">
              {item.country.countryName}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl pt-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="border border-[#ddd] bg-white p-4">
              {item.images?.length > 0 ? (
                <>
                  <div className="aspect-[4/3] overflow-hidden bg-[#f1f1f1]">
                    <SensitiveImage
                      src={item.images[selectedImage]?.imageUrl || undefined}
                      sensitive={Boolean(item.images[selectedImage]?.sensitive)}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  {item.images.length > 1 && (
                    <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                      {item.images.map((img: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`aspect-square rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                            selectedImage === idx
                              ? "border-brand-red shadow-xl scale-105 ring-2 ring-brand-red/50"
                              : "border-transparent hover:border-brand-yellow hover:scale-105"
                          }`}
                        >
                          <SensitiveImage
                            src={img.imageUrl || undefined}
                            sensitive={Boolean(img.sensitive)}
                            alt={`${item.name} - ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-[#f1f1f1]">
                  <span className="text-brand-red/30 font-black text-7xl">
                    ?
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="order-1 space-y-6 lg:order-2">
            <div className="border-b border-[#ddd] pb-5">
              <h2 className="mb-4 border-b border-[#ddd] pb-3 font-display text-xl font-black text-brand-redDark md:text-2xl">
                {uiText("THÔNG TIN CHI TIẾT")}{" "}
              </h2>
              <div className="grid gap-4">
                <TranslationNotice status={item.translationStatus} />
                {item.country?.countryName && (
                  <div className="flex items-start gap-4">
                    <MapPin
                      className="mt-1 flex-shrink-0 text-brand-red"
                      size={24}
                    />
                    <div>
                      <div className="text-sm font-black text-brand-text/60 uppercase tracking-wider mb-1">
                        {uiText("Quốc gia")}
                      </div>
                      <div className="text-xl font-bold text-brand-text">
                        {item.country.countryName}
                      </div>
                    </div>
                  </div>
                )}
                {item.createdAt && (
                  <div className="flex items-start gap-4">
                    <Calendar
                      className="mt-1 flex-shrink-0 text-brand-red"
                      size={24}
                    />
                    <div>
                      <div className="text-sm font-black text-brand-text/60 uppercase tracking-wider mb-1">
                        {uiText("Ngày thêm")}
                      </div>
                      <div className="text-xl font-bold text-brand-text">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {item.description && (
              <div className="border-b border-[#ddd] pb-5">
                <h2 className="mb-3 font-display text-xl font-black text-brand-redDark md:text-2xl">
                  {uiText("MÔ TẢ")}
                </h2>
                <p className="whitespace-pre-wrap text-base leading-7 text-brand-text/90">
                  {item.description}
                </p>
              </div>
            )}

            {item.history && (
              <div className="border-b border-[#ddd] pb-5">
                <h2 className="mb-3 font-display text-xl font-black text-brand-redDark md:text-2xl">
                  {uiText("LỊCH SỬ SỬ DỤNG")}
                </h2>
                <p className="whitespace-pre-wrap text-base leading-7 text-brand-text/90">
                  {item.history}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          {referenceImages.length > 0 && (
            <section className="mb-10 border-y border-[#ddd] py-6">
              <h2 className="mb-5 border-b border-[#ddd] pb-3 font-display text-2xl font-black text-brand-redDark">
                REFERENCE
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {referenceImages.map((image) => (
                  <figure
                    key={image.id}
                    className="overflow-hidden border border-[#ddd] bg-[#FBF9F5]"
                  >
                    <SensitiveImage
                      src={image.imageUrl || undefined}
                      sensitive={Boolean(image.sensitive)}
                      alt={image.description || item.name}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    {image.description && (
                      <figcaption className="p-3 text-sm leading-relaxed text-brand-text/80">
                        {image.description}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}
          {item?.id && <CommentSection uniformId={item.id} />}
        </div>
      </section>
    </ContentPageLayout>
  );
}
