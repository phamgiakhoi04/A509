import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { apiError } from "@/utils/apiError";
export default function EditReenactment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ countryName: "", continent: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    adminApi
      .getCountryById(Number(id))
      .then((data) => {
        if (active)
          setForm({
            countryName: data.countryName || "",
            continent: data.continent || "",
          });
      })
      .catch((e) => {
        if (active) setError(apiError(e, "Không tải được quốc gia."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminApi.updateCountry(Number(id), {
        countryName: form.countryName.trim(),
        continent: form.continent.trim(),
      });
      navigate("/admin/phuc-dung");
    } catch (e) {
      setError(apiError(e, "Không thể lưu quốc gia."));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="admin-page mx-auto max-w-3xl p-6 md:p-8">
      <button
        onClick={() => navigate("/admin/phuc-dung")}
        className="mb-6 text-brand-red"
      >
        ← Quay lại phục dựng
      </button>
      <h1 className="mb-6 border-b border-brand-red pb-4 text-3xl font-bold text-brand-red">
        Chỉnh sửa quốc gia
      </h1>
      {error && (
        <p role="alert" className="mb-4 text-red-700">
          {error}
        </p>
      )}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <form
          onSubmit={save}
          className="space-y-5 rounded-xl border bg-white p-6"
        >
          <label className="block font-bold">
            Tên quốc gia
            <input
              required
              maxLength={150}
              className="mt-2 block w-full rounded border p-3 font-normal"
              value={form.countryName}
              onChange={(e) =>
                setForm({ ...form, countryName: e.target.value })
              }
            />
          </label>
          <label className="block font-bold">
            Châu lục
            <input
              maxLength={100}
              className="mt-2 block w-full rounded border p-3 font-normal"
              value={form.continent}
              onChange={(e) => setForm({ ...form, continent: e.target.value })}
            />
          </label>
          <p className="text-sm text-gray-500">
            Tên quốc gia hiển thị trong danh sách chọn trước lực lượng và giai
            đoạn.
          </p>
          <button
            disabled={saving || !form.countryName.trim()}
            className="rounded bg-brand-red px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu quốc gia"}
          </button>
        </form>
      )}
    </div>
  );
}
