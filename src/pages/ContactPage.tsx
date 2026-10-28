import { useState } from "react";
import { contactApi } from "@/api/contactApi";
import LegacySidebar from "@/components/layout/LegacySidebar";
import ContentPageLayout, { ContentPageTitle } from "@/components/layout/ContentPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
  const { language } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [sending, setSending] = useState(false);
  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSending(true); setStatus("idle");
    try { await contactApi.send(form); setStatus("success"); setForm({ name: "", email: "", subject: "", message: "" }); }
    catch { setStatus("error"); } finally { setSending(false); }
  };
  return <ContentPageLayout sidebar={<LegacySidebar />}>
    <ContentPageTitle>{language === "en" ? "Contact A509" : "Liên hệ với A509"}</ContentPageTitle>
    <p className="mb-7 text-[16px] leading-7">{language === "en" ? "Questions, research materials to contribute, or feedback? Send us a message." : "Nếu bạn có câu hỏi, tư liệu muốn đóng góp hoặc ý kiến về nội dung, hãy gửi tin nhắn cho chúng tôi."}</p>
    <div className="mb-7 border-l-4 border-[#b51f24] bg-[#f1f1f1] px-4 py-3 leading-7">Email: <a className="text-[#b51f24]" href="mailto:a509vietnam@gmail.com">a509vietnam@gmail.com</a><br />{language === "en" ? "Location: Vietnam" : "Địa chỉ: Việt Nam"}</div>
    {status === "success" && <div className="mb-5 border-l-4 border-green-600 bg-green-50 p-3 font-bold text-green-700">{language === "en" ? "Your message has been sent." : "Đã gửi tin nhắn thành công."}</div>}
    {status === "error" && <div className="mb-5 border-l-4 border-[#b51f24] bg-red-50 p-3 font-bold text-[#b51f24]">{language === "en" ? "Could not send your message. Please try again." : "Không thể gửi tin nhắn. Vui lòng thử lại."}</div>}
    <form onSubmit={submit} className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder={language === "en" ? "Full name" : "Họ và tên"} className="border border-[#ccc] px-3 py-3 outline-none focus:border-[#b51f24]" /><input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Email" className="border border-[#ccc] px-3 py-3 outline-none focus:border-[#b51f24]" /></div><select required value={form.subject} onChange={(e) => update("subject", e.target.value)} className="w-full border border-[#ccc] bg-white px-3 py-3 outline-none"><option value="">{language === "en" ? "Choose a subject" : "Chọn chủ đề"}</option><option value="Đóng góp tư liệu">{language === "en" ? "Contribute research material" : "Đóng góp tư liệu"}</option><option value="Góp ý kiến">{language === "en" ? "Feedback" : "Góp ý kiến"}</option><option value="Hợp tác">{language === "en" ? "Partnership" : "Hợp tác"}</option><option value="Khác">{language === "en" ? "Other" : "Khác"}</option></select><textarea required rows={6} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder={language === "en" ? "Your message" : "Nội dung tin nhắn"} className="w-full resize-none border border-[#ccc] px-3 py-3 outline-none focus:border-[#b51f24]" /><button disabled={sending} className="bg-[#b51f24] px-7 py-3 font-bold text-white hover:bg-[#922b21] disabled:opacity-60">{sending ? (language === "en" ? "SENDING..." : "ĐANG GỬI...") : (language === "en" ? "SEND MESSAGE" : "GỬI TIN NHẮN")}</button></form>
  </ContentPageLayout>;
}
