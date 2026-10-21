import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import LegacySidebar from "@/components/layout/LegacySidebar";
import SensitiveImage from "@/components/SensitiveImage";

export default function UniformPage() {
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    adminApi.getAllUniforms().then(setItems).catch(() => setItems([]));
  }, []);

  const filtered = items
    .filter((item) => item.category?.categoryType === "UNIFORM")
    .filter((item) => `${item.name} ${item.description || ""}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="bg-white px-5 py-6 font-sans text-[#333]">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_290px]">
        <main>
          <div className="mb-7 bg-[#f1f1f1] px-3 py-2 text-[16px]">Tài liệu&nbsp; / &nbsp;Quân trang</div>
          <div className="mb-6 flex border border-[#ccc]">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tra cứu..." className="min-w-0 flex-1 px-3 py-2 italic outline-none" />
            <button type="button" className="bg-[#1674c8] px-5 text-xl text-white">›</button>
          </div>
          {filtered.length ? (
            <div className="space-y-6">
              {filtered.map((item) => {
                const image = item.images?.[0];
                return (
                  <Link key={item.id} to={`/tai-lieu/quan-trang/${item.id}`} className="group grid gap-5 border-b border-[#ddd] pb-6 md:grid-cols-[220px_1fr]">
                    <div className="aspect-[4/3] overflow-hidden bg-[#f1f1f1]">
                      {image?.imageUrl || image?.sensitive ? (
                        <SensitiveImage src={image.imageUrl || undefined} sensitive={Boolean(image.sensitive)} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl text-[#ccc]">▧</div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-sans text-[21px] font-bold uppercase leading-tight group-hover:text-[#b51f24]">{item.name}</h2>
                      <p className="mt-2 text-[16px] leading-6 text-[#555]">{item.description || "Nội dung đang được cập nhật..."}</p>
                      <span className="mt-3 inline-block text-[#b51f24]">Xem chi tiết ›</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : <p className="py-16 text-center text-[#777]">Chưa có dữ liệu quân trang.</p>}
        </main>
        <LegacySidebar />
      </div>
    </div>
  );
}
