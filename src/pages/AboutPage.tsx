import ContentPageLayout, { ContentPageTitle } from "@/components/layout/ContentPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function GioiThieu() {
  const { language } = useLanguage();
  return (
    <ContentPageLayout>
      <ContentPageTitle>{language === "en" ? "About A509" : "Giới thiệu A509"}</ContentPageTitle>
      <p className="text-[17px] leading-7">A509 - Research &amp; Reenactment Group</p>
      <p className="mt-3 text-[17px] leading-7">{language === "en" ? "Vietnamese historical reenactment and documentation project." : "Dự án tái hiện lịch sử và tư liệu Việt Nam."}</p>
    </ContentPageLayout>
  );
}
