import TranslationNotice from "@/components/TranslationNotice";
import { useLanguage as useUILanguage } from "@/contexts/LanguageContext";
import { translateUI } from "@/utils/uiTranslations";
import { Link, useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { publicContentApi } from "@/api/publicContentApi";
import FlexGallery from "@/components/FlexGallery";
import ContentPageLayout, {
  ContentPageTitle,
} from "@/components/layout/ContentPageLayout";
import { useAuth } from "@/contexts/AuthContext";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ReenactmentHierarchyPage() {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const { isAuthenticated } = useAuth();
  const { countrySlug, unitSlug, periodSlug } = useParams();
  const location = useLocation();
  const [countries, setCountries] = useState<any[]>([]);
  const [uniforms, setUniforms] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (loading || !location.hash.startsWith("#content-")) return;
    const frame = requestAnimationFrame(() =>
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({ block: "start" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [loading, location.hash]);

  useEffect(() => {
    let active = true;
    const loadHierarchy = async () => {
      setLoading(true);
      setError("");
      try {
        const [countryData, categoryData] = await Promise.all([
          publicContentApi.getCountries(),
          publicContentApi.getReenactmentRoots(),
        ]);

        if (!active) return;
        setCountries(countryData || []);
        const root =
          (categoryData || []).find(
            (item: any) =>
              slugify(item.sourceName || item.categoryName || "") ===
              "phuc-dung-trang-phuc",
          ) || (categoryData || [])[0];
        const selectedCountry = (countryData || []).find(
          (item: any) =>
            slugify(item.sourceName || item.countryName || "") === countrySlug,
        );
        const scopedChildren = countrySlug
          ? (root?.children || []).filter(
              (item: any) =>
                Number(item.countryId) === Number(selectedCountry?.id),
            )
          : root?.children || [];

        setUnits(
          scopedChildren.map((item: any) => ({
            slug: slugify(item.sourceName || item.categoryName),
            label: item.categoryName,
            prefix: item.categoryName,
          })) || [],
        );

        const selectedUnit = scopedChildren.find(
          (item: any) =>
            slugify(item.sourceName || item.categoryName || "") === unitSlug,
        );
        setPeriods(
          (selectedUnit?.children || []).map((item: any) => ({
            slug:
              item.slug || slugify(item.sourceName || item.categoryName || ""),
            label: item.categoryName,
            id: item.id,
            description: item.description,
          })),
        );
        const selectedPeriod = selectedUnit?.children?.find(
          (item: any) =>
            (item.slug ||
              slugify(item.sourceName || item.categoryName || "")) ===
            periodSlug,
        );
        const uniformData =
          selectedPeriod && selectedCountry && selectedUnit
            ? await publicContentApi.getShowcase(
                selectedCountry.id,
                selectedUnit.id,
                selectedPeriod.id,
              )
            : [];
        if (active) setUniforms(uniformData);
      } catch {
        if (active)
          setError(
            uiText("Không thể tải nội dung phục dựng. Vui lòng thử lại."),
          );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHierarchy();
    return () => {
      active = false;
    };
  }, [periodSlug, countrySlug, unitSlug, isAuthenticated]);

  const country = countries.find(
    (item) =>
      slugify(item.sourceName || item.countryName || "") === countrySlug,
  );

  if (loading || error)
    return (
      <ContentPageLayout>
        <p className="py-16 text-center" role={error ? "alert" : "status"}>
          {error || uiText("Đang tải nội dung...")}
        </p>
      </ContentPageLayout>
    );

  if (periodSlug) {
    return (
      <Detail
        period={periods.find((period) => period.slug === periodSlug)}
        country={country}
        uniforms={uniforms}
        unitSlug={unitSlug}
      />
    );
  }

  const basePath = "/hoat-dong/phuc-dung";
  if (unitSlug) {
    return (
      <Cards
        title={
          units.find((unit) => unit.slug === unitSlug)?.prefix ||
          uiText("Đơn vị")
        }
        items={periods.map((period) => ({
          to: `${basePath}/${countrySlug || "viet-nam"}/${unitSlug}/${period.slug}`,
          label: period.label,
        }))}
      />
    );
  }
  if (countrySlug) {
    return (
      <Cards
        title={uiText("Phục dựng trang phục")}
        items={units.map((unit) => ({
          to: `${basePath}/${countrySlug}/${unit.slug}`,
          label: unit.label,
        }))}
      />
    );
  }

  return (
    <Cards
      title={uiText("Phục dựng trang phục")}
      items={countries.map((item) => ({
        to: `${basePath}/${slugify(item.sourceName || item.countryName)}`,
        label: item.countryName,
      }))}
    />
  );
}

function Cards({
  title,
  items,
}: {
  title: string;
  items: { to: string; label: string; image?: string }[];
}) {
  return (
    <ContentPageLayout>
      <main className="mx-auto w-full max-w-5xl">
        <ContentPageTitle>{title}</ContentPageTitle>
        <div className="divide-y border-y border-gray-200">
          {items.map((item) => (
            <Link key={item.to} to={item.to} className="group block py-5">
              <h2 className="font-display text-xl font-bold text-black group-hover:text-[#b51f24]">
                {item.label}
              </h2>
            </Link>
          ))}
        </div>
      </main>
    </ContentPageLayout>
  );
}

function Detail({
  period,
  uniforms,
}: {
  period?: { id: number; slug: string; label: string; description?: string };
  country?: any;
  uniforms: any[];
  unitSlug?: string;
}) {
  const { language: uiLanguage } = useUILanguage();
  const uiText = (text: string) => translateUI(text, uiLanguage);

  const records = uniforms;

  return (
    <ContentPageLayout>
      <main className="mx-auto w-full max-w-5xl">
        {period && (
          <header className="mb-8">
            <ContentPageTitle>{period.label}</ContentPageTitle>
            {period.description && (
              <p className="whitespace-pre-line text-[17px] leading-7 text-[#444]">
                {period.description}
              </p>
            )}
          </header>
        )}
        {(period &&
          (records.length ? (
            <div className="space-y-12">
              {records.map((item: any) => {
                const images = (item.images || []).filter(
                  (image: any) => image.imageUrl || image.sensitive,
                );

                return (
                  <details
                    id={`content-${item.id}`}
                    key={item.id}
                    open
                    className="group"
                  >
                    <summary className="mb-5 cursor-pointer border-l-4 border-brand-red bg-[#f1f1f1] px-3 py-3 font-sans text-xl font-bold text-[#b51f24]">
                      {item.name}
                    </summary>
                    <TranslationNotice status={item.translationStatus} />
                    {item.description && (
                      <p className="mb-7 whitespace-pre-line text-[17px] leading-7 text-[#444]">
                        {item.description}
                      </p>
                    )}
                    {item.history && (
                      <p className="mb-7 whitespace-pre-line text-[17px] leading-7 text-[#444]">
                        {item.history}
                      </p>
                    )}
                    {images.length ? (
                      <FlexGallery images={images} title={item.name} />
                    ) : (
                      <p className="py-8 text-center text-[#777]">
                        {uiText("Nội dung này chưa có ảnh.")}
                      </p>
                    )}
                  </details>
                );
              })}
            </div>
          ) : (
            <div>
              <p className="py-16 text-center text-[#777]">
                {uiText("Chưa có nội dung phục dựng trong cơ sở dữ liệu.")}
              </p>
            </div>
          ))) || (
          <p className="py-16 text-center text-[#777]">
            {uiText("Giai đoạn không tồn tại.")}
          </p>
        )}
      </main>
    </ContentPageLayout>
  );
}
