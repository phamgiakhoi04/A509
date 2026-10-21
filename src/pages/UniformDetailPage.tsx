import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { articleApi } from "@/api/articleApi";
import { Loader2, Calendar, MapPin } from "lucide-react";
import CommentSection from "@/components/CommentSection";
import SensitiveImage from "@/components/SensitiveImage";

export default function UniformDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [referenceImages, setReferenceImages] = useState<{ id: number; imageUrl: string; description?: string }[]>([]);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

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
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-red mx-auto mb-4" size={48} />
          <p className="font-display text-2xl text-brand-text/70">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-center px-4">
        <div>
          <p className="font-display text-3xl text-brand-text/50 mb-6">Không tìm thấy quân trang</p>
          <Link to="/quan-trang" className="inline-block px-6 py-3 bg-brand-red text-white font-bold rounded-xl hover:bg-brand-redDark transition-all">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-body text-brand-text bg-brand-bg min-h-screen pb-20">
      <section className="bg-gradient-to-br from-brand-redDark to-brand-red py-16 md:py-20">
        <div className="container-page">
          <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-brand-yellow drop-shadow-2xl">
            {item.name}
          </h1>
          {item.country?.countryName && (
            <div className="mt-6 inline-block bg-brand-yellow text-brand-redDark text-sm md:text-base font-black px-5 py-2 rounded-full uppercase tracking-wider">
              {item.country.countryName}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 container-page">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-6 shadow-pop border-4 border-brand-yellow/20">
              {item.images?.length > 0 ? (
                <>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-brand-bg bg-brand-bg/50">
                    <SensitiveImage
                      src={item.images[selectedImage]?.imageUrl || undefined}
                      sensitive={Boolean(item.images[selectedImage]?.sensitive)}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  {item.images.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-6">
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
                          <SensitiveImage src={img.imageUrl || undefined} sensitive={Boolean(img.sensitive)} alt={`${item.name} - ${idx + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[4/3] rounded-2xl bg-brand-bg/50 flex items-center justify-center">
                  <span className="text-brand-red/30 font-black text-7xl">?</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8 order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-8 shadow-pop border-4 border-brand-yellow/20">
              <h2 className="font-display font-black text-2xl md:text-3xl text-brand-redDark mb-6 pb-4 border-b-4 border-brand-yellow/30">
                THÔNG TIN CHI TIẾT
              </h2>
              <div className="grid gap-6">
                {item.country?.countryName && (
                  <div className="flex items-start gap-4">
                    <MapPin className="text-brand-red flex-shrink-0 mt-1" size={28} />
                    <div>
                      <div className="text-sm font-black text-brand-text/60 uppercase tracking-wider mb-1">Quốc gia</div>
                      <div className="text-xl font-bold text-brand-text">{item.country.countryName}</div>
                    </div>
                  </div>
                )}
                {item.createdAt && (
                  <div className="flex items-start gap-4">
                    <Calendar className="text-brand-red flex-shrink-0 mt-1" size={28} />
                    <div>
                      <div className="text-sm font-black text-brand-text/60 uppercase tracking-wider mb-1">Ngày thêm</div>
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
              <div className="bg-white rounded-3xl p-8 shadow-pop border-4 border-brand-yellow/20">
                <h2 className="font-display font-black text-2xl md:text-3xl text-brand-redDark mb-6">MÔ TẢ</h2>
                <p className="text-lg leading-relaxed text-brand-text/90 whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            {item.history && (
              <div className="bg-white rounded-3xl p-8 shadow-pop border-4 border-brand-yellow/20">
                <h2 className="font-display font-black text-2xl md:text-3xl text-brand-redDark mb-6">LỊCH SỬ SỬ DỤNG</h2>
                <p className="text-lg leading-relaxed text-brand-text/90 whitespace-pre-wrap">{item.history}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16">
          {referenceImages.length > 0 && (
            <section className="mb-16 rounded-3xl border-4 border-brand-yellow/20 bg-white p-8 shadow-pop">
              <h2 className="mb-6 border-b-4 border-brand-yellow/30 pb-4 font-display text-2xl font-black text-brand-redDark md:text-3xl">
                REFERENCE
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {referenceImages.map((image) => (
                  <figure key={image.id} className="overflow-hidden rounded-2xl border border-brand-bg bg-brand-bg/30">
                    <img src={image.imageUrl} alt={image.description || item.name} className="aspect-[4/3] w-full object-cover" />
                    {image.description && <figcaption className="p-3 text-sm leading-relaxed text-brand-text/80">{image.description}</figcaption>}
                  </figure>
                ))}
              </div>
            </section>
          )}
          {item?.id && <CommentSection uniformId={item.id} />}
        </div>
      </section>
    </div>
  );
}
