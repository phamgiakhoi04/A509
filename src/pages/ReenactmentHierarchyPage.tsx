import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { publicContentApi } from "@/api/publicContentApi";
import FlexGallery from "@/components/FlexGallery";
import ContentPageLayout, { ContentPageTitle } from "@/components/layout/ContentPageLayout";
import { useAuth } from "@/contexts/AuthContext";

const slugify = (value: string) => value
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

export default function ReenactmentHierarchyPage() {
  const { isAuthenticated } = useAuth();
  const { countrySlug, unitSlug, periodSlug } = useParams();
  const [countries, setCountries] = useState<any[]>([]);
  const [uniforms, setUniforms] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadHierarchy = async () => {
      setLoading(true); setError("");
      try {
      const [countryData, categoryData] = await Promise.all([
        publicContentApi.getCountries(), publicContentApi.getReenactmentRoots(),
      ]);

      if (!active) return;
      setCountries(countryData || []);
      const root = (categoryData || []).find((item: any) => slugify(item.categoryName || "") === "phuc-dung-trang-phuc") || (categoryData || [])[0];
      const selectedCountry = (countryData || []).find((item: any) => slugify(item.countryName || "") === countrySlug);
      const scopedChildren = countrySlug
        ? (root?.children || []).filter((item: any) => Number(item.countryId) === Number(selectedCountry?.id))
        : (root?.children || []);

      setUnits(scopedChildren.map((item: any) => ({
        slug: slugify(item.categoryName),
        label: item.categoryName,
        prefix: item.categoryName,
      })) || []);

      const selectedUnit = scopedChildren.find((item: any) => slugify(item.categoryName || "") === unitSlug);
      setPeriods((selectedUnit?.children || []).map((item: any) => ({
        slug: item.slug || slugify(item.categoryName || ""),
        label: item.categoryName,
        id: item.id,
        description: item.description,
      })));
      const selectedPeriod = selectedUnit?.children?.find((item: any) => (item.slug || slugify(item.categoryName || "")) === periodSlug);
      const uniformData = selectedPeriod && selectedCountry && selectedUnit
        ? await publicContentApi.getShowcase(selectedCountry.id, selectedUnit.id, selectedPeriod.id) : [];
      if (active) setUniforms(uniformData);
      } catch { if (active) setError("Không thể tải nội dung phục dựng. Vui lòng thử lại."); }
      finally { if (active) setLoading(false); }
    };

    loadHierarchy();
    return () => { active = false; };
  }, [periodSlug, countrySlug, unitSlug, isAuthenticated]);

  const country = countries.find((item) => slugify(item.countryName || "") === countrySlug);

  if (loading || error) return <ContentPageLayout><p className="py-16 text-center" role={error ? "alert" : "status"}>{error || "Đang tải nội dung..."}</p></ContentPageLayout>;

  if (periodSlug) {
    return <Detail period={periods.find((period) => period.slug === periodSlug)} country={country} uniforms={uniforms} unitSlug={unitSlug} />;
  }

  const basePath = "/hoat-dong/phuc-dung";
  if (unitSlug) {
    return <Cards title={units.find((unit) => unit.slug === unitSlug)?.prefix || "Đơn vị"} items={periods.map((period) => ({
      to: `${basePath}/${countrySlug || "viet-nam"}/${unitSlug}/${period.slug}`,
      label: period.label,
    }))} />;
  }
  if (countrySlug) {
    return <Cards title="Phục dựng trang phục" items={units.map((unit) => ({
      to: `${basePath}/${countrySlug}/${unit.slug}`,
      label: unit.label,
    }))} />;
  }

  return <Cards title="Phục dựng trang phục" items={countries.map((item) => ({
    to: `${basePath}/${slugify(item.countryName)}`,
    label: item.countryName,
    image: item.flagImageUrl,
  }))} />;
}

function Cards({ title, items }: { title: string; items: { to: string; label: string; image?: string }[] }) {
  return (
    <ContentPageLayout>
      <main className="mx-auto w-full max-w-5xl">
        <ContentPageTitle>{title}</ContentPageTitle>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {items.map((item) => (
            <Link key={item.to} to={item.to} className="group bg-[#f1f1f1] p-4 text-center">
              <div className="mb-3 flex aspect-[4/3] items-center justify-center bg-white">
                {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <span className="text-5xl text-[#ddd]">▧</span>}
              </div>
              <h2 className="font-display text-xl font-bold text-black group-hover:text-[#b51f24]">{item.label}</h2>
            </Link>
          ))}
        </div>
      </main>
    </ContentPageLayout>
  );
}

function Detail({ period, uniforms }: { period?: { id: number; slug: string; label: string; description?: string }; country?: any; uniforms: any[]; unitSlug?: string }) {
  const records = uniforms;

  return (
    <ContentPageLayout>
      <main className="mx-auto w-full max-w-5xl">
        {period && <header className="mb-8"><ContentPageTitle>{period.label}</ContentPageTitle>
          {period.description && <p className="whitespace-pre-line text-[17px] leading-7 text-[#444]">{period.description}</p>}
        </header>}
        {period && (records.length ? (
          <div className="space-y-12">
            {records.map((item: any) => {
              const images = (item.images || []).filter((image: any) => image.imageUrl || image.sensitive);

              return (
                <details key={item.id} open className="group">
                  <summary className="mb-5 cursor-pointer border-l-4 border-brand-red bg-[#f1f1f1] px-3 py-3 font-sans text-xl font-bold text-[#b51f24]">{item.name}</summary>
                  {item.description && <p className="mb-7 whitespace-pre-line text-[17px] leading-7 text-[#444]">{item.description}</p>}
                  {item.history && <p className="mb-7 whitespace-pre-line text-[17px] leading-7 text-[#444]">{item.history}</p>}
                  {images.length ? (
                    <FlexGallery images={images} title={item.name} />
                  ) : <p className="py-8 text-center text-[#777]">Nội dung này chưa có ảnh.</p>}
                </details>
              );
            })}
          </div>
        ) : (
          <div>
            <p className="py-16 text-center text-[#777]">Chưa có nội dung phục dựng trong cơ sở dữ liệu.</p>
          </div>
        )) || <p className="py-16 text-center text-[#777]">Giai đoạn không tồn tại.</p>}
      </main>
    </ContentPageLayout>
  );
}
