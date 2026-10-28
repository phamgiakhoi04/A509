import { apiError } from "@/utils/apiError";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import UniformManager from "@/pages/admin/UniformManager";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  CalendarDays,
  Edit,
  Globe2,
  ImagePlus,
  Landmark,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

type Step = "countries" | "forces" | "periods" | "content";
type Country = {
  id: number;
  countryName: string;
  continent?: string;
  flagImageUrl?: string;
};
type Force = {
  id: number;
  categoryName: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  countryId?: number;
  parentId?: number;
  children?: Force[];
};

const steps: {
  id: Step;
  title: string;
  description: string;
  icon: typeof Globe2;
}[] = [
  {
    id: "countries",
    title: "Quốc gia",
    description: "Danh sách quốc gia bằng chữ",
    icon: Globe2,
  },
  {
    id: "forces",
    title: "Lực lượng",
    description: "Tạo nhóm nội dung cho từng quốc gia",
    icon: Landmark,
  },
  {
    id: "periods",
    title: "Giai đoạn",
    description: "Quản lý các giai đoạn theo lực lượng",
    icon: CalendarDays,
  },
  {
    id: "content",
    title: "Nội dung & ảnh",
    description: "Nhập bài viết, giai đoạn và thư viện ảnh",
    icon: ImagePlus,
  },
];

export default function ReenactmentManager() {
  const [activeStep, setActiveStep] = useState<Step>("countries");
  const [countries, setCountries] = useState<Country[]>([]);
  const [root, setRoot] = useState<Force | null>(null);
  const [forces, setForces] = useState<Force[]>([]);
  const [selectedForceCountryId, setSelectedForceCountryId] = useState<
    number | null
  >(null);
  const [selectedForceId, setSelectedForceId] = useState<number | null>(null);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [setupError, setSetupError] = useState("");
  const navigate = useNavigate();

  const refreshSetup = async () => {
    setLoadingSetup(true);
    setSetupError("");
    try {
      const [countryResult, categoryResult] = await Promise.allSettled([
        adminApi.getAllCountries(),
        adminApi.getRootCategoriesByType("REENACTMENT"),
      ]);
      const countryData =
        countryResult.status === "fulfilled" ? countryResult.value : [];
      const categoryData =
        categoryResult.status === "fulfilled" ? categoryResult.value : [];
      if (
        countryResult.status === "rejected" ||
        categoryResult.status === "rejected"
      ) {
        setSetupError(
          "Không thể tải dữ liệu phục dựng. Hãy kiểm tra backend đang chạy đúng phiên bản và khởi động lại cổng 8080.",
        );
      }
      const nextCountries = countryData || [];
      setCountries(nextCountries);
      setSelectedForceCountryId((current) =>
        current &&
        nextCountries.some((country: Country) => Number(country.id) === current)
          ? current
          : nextCountries[0]?.id
            ? Number(nextCountries[0].id)
            : null,
      );
      const reenactmentRoot =
        (categoryData || []).find(
          (item: any) => item.categoryType === "REENACTMENT",
        ) ||
        (categoryData || [])[0] ||
        null;
      setRoot(reenactmentRoot);
      setForces(reenactmentRoot?.children || []);
      setSelectedForceId((current) => {
        const countryId =
          selectedForceCountryId &&
          nextCountries.some(
            (country: Country) =>
              Number(country.id) === Number(selectedForceCountryId),
          )
            ? selectedForceCountryId
            : nextCountries[0]?.id
              ? Number(nextCountries[0].id)
              : null;
        const countryForces = (reenactmentRoot?.children || []).filter(
          (force: Force) => Number(force.countryId) === Number(countryId),
        );
        return current &&
          countryForces.some((force: Force) => force.id === current)
          ? current
          : countryForces[0]?.id || null;
      });
    } catch (error) {
      console.error("Không thể tải cấu hình phục dựng:", error);
    } finally {
      setLoadingSetup(false);
    }
  };

  useEffect(() => {
    refreshSetup();
  }, []);

  const completed = useMemo(
    () => ({
      countries: countries.length > 0,
      forces: forces.length > 0,
      periods: forces.some(
        (force) =>
          Number(force.countryId) === Number(selectedForceCountryId) &&
          (force.children?.length || 0) > 0,
      ),
      content: countries.length > 0 && forces.length > 0,
    }),
    [countries.length, forces, selectedForceCountryId],
  );

  const selectStep = (step: Step) => {
    if (step === "forces" && !completed.countries) {
      alert("Hãy tạo ít nhất một quốc gia ở bước 1 trước.");
      setActiveStep("countries");
      return;
    }
    if (
      (step === "periods" || step === "content") &&
      (!completed.countries || !completed.forces)
    ) {
      alert("Hãy hoàn tất quốc gia và lực lượng trước.");
      setActiveStep(completed.countries ? "forces" : "countries");
      return;
    }
    if (step === "content" && !completed.periods) {
      alert(
        "Hãy tạo ít nhất một giai đoạn cho lực lượng trước khi nhập nội dung.",
      );
      setActiveStep("periods");
      return;
    }
    setActiveStep(step);
  };

  return (
    <div className="admin-page min-h-full bg-[#faf8f3] p-5 font-body md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-brand-red/15 bg-white px-6 py-7 shadow-pop md:px-8">
          <h1 className="font-display text-3xl font-black uppercase text-brand-redDark md:text-4xl">
            Quản lý phục dựng
          </h1>
        </header>

        {setupError && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-bold">Không tải được dữ liệu</p>
              <p className="mt-1 text-sm">{setupError}</p>
            </div>
          </div>
        )}

        <nav
          aria-label="Quy trình nhập dữ liệu"
          className="grid overflow-hidden rounded-3xl border border-brand-red/15 bg-white md:grid-cols-4"
        >
          {steps.map((step, index) => {
            const isActive = activeStep === step.id;
            const isDone = completed[step.id];
            return (
              <button
                key={step.id}
                onClick={() => selectStep(step.id)}
                className={`relative flex min-h-28 items-center gap-4 p-5 text-left transition-colors ${isActive ? "bg-brand-red text-white" : "hover:bg-brand-bg"}`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black ${isActive ? "bg-white text-brand-red" : isDone ? "bg-green-100 text-green-700" : "bg-brand-bg text-brand-red"}`}
                >
                  {isDone && !isActive ? <CheckCircle size={21} /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-black uppercase">
                    {step.title}
                  </span>
                  <span
                    className={`mt-1 block text-sm ${isActive ? "text-white/80" : "text-brand-text/60"}`}
                  >
                    {step.description}
                  </span>
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight
                    className="absolute -right-3 z-10 hidden rounded-full bg-white p-1 text-brand-red shadow md:block"
                    size={28}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {loadingSetup ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl bg-white">
            <Loader2 className="animate-spin text-brand-red" size={38} />
          </div>
        ) : (
          <>
            {activeStep === "countries" && (
              <CountryStep
                countries={countries}
                onChanged={refreshSetup}
                onNext={() => selectStep("forces")}
                navigate={navigate}
              />
            )}
            {activeStep === "forces" && (
              <ForceStep
                countries={countries}
                selectedCountryId={selectedForceCountryId}
                onCountryChange={setSelectedForceCountryId}
                root={root}
                forces={forces.filter(
                  (force) => Number(force.countryId) === selectedForceCountryId,
                )}
                onChanged={refreshSetup}
                onNext={() => selectStep("periods")}
              />
            )}
            {activeStep === "periods" && (
              <PeriodStep
                countries={countries}
                forces={forces}
                selectedCountryId={selectedForceCountryId}
                selectedForceId={selectedForceId}
                onCountryChange={setSelectedForceCountryId}
                onForceChange={setSelectedForceId}
                onChanged={refreshSetup}
                onNext={() => selectStep("content")}
              />
            )}
            {activeStep === "content" && (
              <ContentStep
                countries={countries}
                forces={forces}
                selectedCountryId={selectedForceCountryId}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CountryStep({
  countries,
  onChanged,
  onNext,
  navigate,
}: {
  countries: Country[];
  onChanged: () => Promise<void>;
  onNext: () => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Country | null>(null);
  const [form, setForm] = useState({ countryName: "", continent: "" });
  const closeForm = () => {
    setShowForm(false);
    setForm({ countryName: "", continent: "" });
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminApi.createCountry(form);
      closeForm();
      await onChanged();
    } catch (error: any) {
      alert(apiError(error, "Không thể tạo quốc gia."));
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!deleting) return;
    try {
      await adminApi.deleteCountry(deleting.id);
      setDeleting(null);
      await onChanged();
    } catch (error: any) {
      alert(
        apiError(error, "Không thể xóa quốc gia đang có nội dung liên quan."),
      );
    }
  };

  return (
    <section className="space-y-5">
      <SectionIntro
        number="Bước 1"
        title="Tạo quốc gia"
        description="Quốc gia → Lực lượng → Giai đoạn → Nội dung. Website hiển thị danh sách chữ ở từng bước."
        action={
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-3 font-bold text-white shadow-pop hover:bg-brand-redDark"
          >
            <Plus size={20} /> Thêm quốc gia
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <article
            key={country.id}
            className="overflow-hidden rounded-2xl border border-brand-red/15 bg-white shadow-sm"
          >
            <div className="p-5">
              <h2 className="text-xl font-bold text-brand-redDark">
                {country.countryName}
              </h2>
              <p className="mt-1 min-h-10 text-sm text-brand-text/60">
                {country.continent || "Chưa có châu lục"}
              </p>
              <div className="mt-4 flex justify-end gap-2 border-t border-brand-red/10 pt-4">
                <button
                  onClick={() =>
                    navigate(`/admin/phuc-dung/edit/${country.id}`)
                  }
                  className="rounded-lg p-2 text-brand-red hover:bg-red-50"
                  title="Sửa quốc gia"
                >
                  <Edit size={19} />
                </button>
                <button
                  onClick={() => setDeleting(country)}
                  className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                  title="Xóa quốc gia"
                >
                  <Trash2 size={19} />
                </button>
              </div>
            </div>
          </article>
        ))}
        {!countries.length && (
          <EmptyState
            icon={<Globe2 size={36} />}
            text="Chưa có quốc gia. Hãy thêm quốc gia đầu tiên."
          />
        )}
      </div>
      {countries.length > 0 && (
        <div className="flex justify-end">
          <NextButton label="Tiếp tục tạo lực lượng" onClick={onNext} />
        </div>
      )}

      {showForm && (
        <Modal title="Thêm quốc gia" onClose={closeForm}>
          <form onSubmit={save} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Tên quốc gia *">
                <input
                  required
                  value={form.countryName}
                  onChange={(e) =>
                    setForm({ ...form, countryName: e.target.value })
                  }
                  className="w-full rounded-xl border-2 border-brand-red/25 p-3 outline-none focus:border-brand-red"
                  placeholder="Ví dụ: Việt Nam"
                />
              </Field>
              <Field label="Châu lục">
                <input
                  value={form.continent}
                  onChange={(e) =>
                    setForm({ ...form, continent: e.target.value })
                  }
                  className="w-full rounded-xl border-2 border-brand-red/25 p-3 outline-none focus:border-brand-red"
                  placeholder="Ví dụ: Châu Á"
                />
              </Field>
            </div>
            <ModalActions
              onCancel={closeForm}
              saving={saving}
              label="Lưu quốc gia"
            />
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmModal
          message={`Xóa quốc gia “${deleting.countryName}”? Chỉ xóa được khi quốc gia chưa có nội dung phục dựng.`}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </section>
  );
}

function ForceStep({
  countries,
  selectedCountryId,
  onCountryChange,
  root,
  forces,
  onChanged,
  onNext,
}: {
  countries: Country[];
  selectedCountryId: number | null;
  onCountryChange: (id: number) => void;
  root: Force | null;
  forces: Force[];
  onChanged: () => Promise<void>;
  onNext: () => void;
}) {
  const [editing, setEditing] = useState<Force | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Force | null>(null);
  const open = (force?: Force) => {
    setEditing(force || null);
    setName(force?.categoryName || "");
    setDescription(force?.description || "");
    if (force?.countryId) onCountryChange(Number(force.countryId));
    setShowForm(true);
  };
  const close = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setShowForm(false);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!root) return;
    setSaving(true);
    if (!selectedCountryId) {
      alert("Hãy chọn quốc gia trước khi tạo lực lượng.");
      setSaving(false);
      return;
    }
    const payload = {
      categoryName: name.trim(),
      description: description.trim(),
      categoryType: "REENACTMENT" as const,
      parentId: root.id,
      countryId: selectedCountryId,
      sortOrder: editing?.sortOrder ?? forces.length + 1,
    };
    try {
      if (editing) await adminApi.updateCategory(editing.id, payload);
      else await adminApi.createCategory(payload);
      close();
      await onChanged();
    } catch (error: any) {
      alert(apiError(error, "Không thể lưu lực lượng."));
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!deleting) return;
    try {
      await adminApi.deleteCategory(deleting.id);
      setDeleting(null);
      await onChanged();
    } catch (error: any) {
      alert(apiError(error, "Không thể xóa lực lượng đã có nội dung."));
    }
  };

  if (!root)
    return (
      <section>
        <SectionIntro
          number="Bước 2"
          title="Tạo lực lượng"
          description="Danh mục gốc “Phục dựng trang phục” đang thiếu trong database."
        />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          <AlertCircle className="mr-2 inline" size={20} />
          Không thể tạo lực lượng khi chưa có danh mục gốc REENACTMENT.
        </div>
      </section>
    );
  return (
    <section className="space-y-5">
      <SectionIntro
        number="Bước 2"
        title="Tạo lực lượng phục dựng"
        description="Mỗi lực lượng thuộc đúng một quốc gia. Chọn quốc gia để chỉ xem và quản lý các lực lượng của quốc gia đó."
        action={
          <button
            disabled={!selectedCountryId}
            onClick={() => open()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-3 font-bold text-white shadow-pop hover:bg-brand-redDark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={20} /> Thêm lực lượng
          </button>
        }
      />
      <div className="rounded-2xl border border-brand-red/15 bg-white p-5 shadow-sm">
        <Field label="Quốc gia đang quản lý *">
          <select
            value={selectedCountryId || ""}
            onChange={(event) => onCountryChange(Number(event.target.value))}
            className="w-full rounded-xl border-2 border-brand-red/25 bg-white p-3 outline-none focus:border-brand-red"
          >
            <option value="">-- Chọn quốc gia --</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.countryName}
              </option>
            ))}
          </select>
        </Field>
        <p className="mt-2 text-sm text-brand-text/60">
          Chỉ các lực lượng gắn với quốc gia này được hiển thị.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {forces.map((force) => (
          <article
            key={force.id}
            className="rounded-2xl border border-brand-red/15 bg-white p-5 shadow-sm"
          >
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-brand-redDark">
                  {force.categoryName}
                </h2>
                <p className="mt-2 text-sm leading-6 text-brand-text/65">
                  {force.description || "Chưa có mô tả."}
                </p>
              </div>
              <div className="flex h-fit gap-1">
                <button
                  onClick={() => open(force)}
                  className="rounded-lg p-2 text-brand-red hover:bg-red-50"
                  title="Sửa lực lượng"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => setDeleting(force)}
                  className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                  title="Xóa lực lượng"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
        {!forces.length && (
          <EmptyState
            icon={<Landmark size={36} />}
            text={
              selectedCountryId
                ? "Quốc gia này chưa có lực lượng. Hãy tạo lực lượng đầu tiên."
                : "Hãy chọn quốc gia để quản lý lực lượng."
            }
          />
        )}
      </div>
      {forces.length > 0 && (
        <div className="flex justify-end">
          <NextButton label="Tiếp tục nhập nội dung" onClick={onNext} />
        </div>
      )}
      {showForm && (
        <Modal
          title={editing ? "Sửa lực lượng" : "Thêm lực lượng"}
          onClose={close}
        >
          <form onSubmit={save} className="space-y-5">
            <Field label="Quốc gia *">
              <select
                required
                value={selectedCountryId || ""}
                onChange={(event) =>
                  onCountryChange(Number(event.target.value))
                }
                className="w-full rounded-xl border-2 border-brand-red/25 bg-white p-3 outline-none focus:border-brand-red"
              >
                <option value="">-- Chọn quốc gia --</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.countryName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tên lực lượng *">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-2 border-brand-red/25 p-3 outline-none focus:border-brand-red"
                placeholder="Ví dụ: Quân đội nhân dân Việt Nam"
              />
            </Field>
            <Field label="Mô tả">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-28 w-full rounded-xl border-2 border-brand-red/25 p-3 outline-none focus:border-brand-red"
                placeholder="Mô tả ngắn cho nhóm nội dung..."
              />
            </Field>
            <ModalActions
              onCancel={close}
              saving={saving}
              label="Lưu lực lượng"
            />
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmModal
          message={`Xóa lực lượng “${deleting.categoryName}”? Phải xóa các giai đoạn và nội dung liên quan trước.`}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </section>
  );
}

const slugifyText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function PeriodStep({
  countries,
  forces,
  selectedCountryId,
  selectedForceId,
  onCountryChange,
  onForceChange,
  onChanged,
  onNext,
}: {
  countries: Country[];
  forces: Force[];
  selectedCountryId: number | null;
  selectedForceId: number | null;
  onCountryChange: (id: number) => void;
  onForceChange: (id: number) => void;
  onChanged: () => Promise<void>;
  onNext: () => void;
}) {
  const [editing, setEditing] = useState<Force | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Force | null>(null);
  const countryForces = forces.filter(
    (force) => Number(force.countryId) === Number(selectedCountryId),
  );
  const selectedForce =
    countryForces.find((force) => force.id === selectedForceId) ||
    countryForces[0];
  const periods = selectedForce?.children || [];

  useEffect(() => {
    if (selectedForce && selectedForce.id !== selectedForceId)
      onForceChange(selectedForce.id);
  }, [selectedForce?.id, selectedForceId, onForceChange]);

  const open = (period?: Force) => {
    setEditing(period || null);
    setName(period?.categoryName || "");
    setDescription(period?.description || "");
    setShowForm(true);
  };
  const close = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setShowForm(false);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedForce || !selectedCountryId || !name.trim()) return;
    setSaving(true);
    const payload = {
      categoryName: name.trim(),
      slug: editing?.slug || slugifyText(name.trim()),
      description: description.trim(),
      categoryType: "REENACTMENT" as const,
      parentId: selectedForce.id,
      countryId: selectedCountryId,
      sortOrder: editing?.sortOrder ?? periods.length + 1,
    };
    try {
      if (editing) await adminApi.updateCategory(editing.id, payload);
      else await adminApi.createCategory(payload);
      close();
      await onChanged();
    } catch (error: any) {
      alert(apiError(error, "Không thể lưu giai đoạn."));
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!deleting) return;
    try {
      await adminApi.deleteCategory(deleting.id);
      setDeleting(null);
      await onChanged();
    } catch (error: any) {
      alert(apiError(error, "Không thể xóa giai đoạn."));
    }
  };

  return (
    <section className="space-y-5">
      <SectionIntro
        number="Bước 3"
        title="Quản lý giai đoạn phục dựng"
        description="Các thẻ như Thời kỳ tiền khởi nghĩa hay Kháng chiến chống Pháp được lưu trong database theo từng lực lượng. Bạn có thể thêm, sửa và xóa tại đây."
        action={
          <button
            disabled={!selectedForce}
            onClick={() => open()}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-3 font-bold text-white shadow-pop hover:bg-brand-redDark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={20} /> Thêm giai đoạn
          </button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Quốc gia *">
          <select
            value={selectedCountryId || ""}
            onChange={(event) => onCountryChange(Number(event.target.value))}
            className="w-full rounded-xl border-2 border-brand-red/25 bg-white p-3"
          >
            <option value="">-- Chọn quốc gia --</option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.countryName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Lực lượng *">
          <select
            value={selectedForce?.id || ""}
            onChange={(event) => onForceChange(Number(event.target.value))}
            className="w-full rounded-xl border-2 border-brand-red/25 bg-white p-3"
          >
            <option value="">-- Chọn lực lượng --</option>
            {countryForces.map((force) => (
              <option key={force.id} value={force.id}>
                {force.categoryName}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {periods.map((period) => (
          <article
            key={period.id}
            className="rounded-2xl border border-brand-red/15 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-brand-redDark">
                  {period.categoryName}
                </h2>
                <p className="mt-2 text-sm text-brand-text/65">
                  {period.description || "Chưa có mô tả."}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => open(period)}
                  className="rounded-lg p-2 text-brand-red hover:bg-red-50"
                  title="Sửa giai đoạn"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => setDeleting(period)}
                  className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                  title="Xóa giai đoạn"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
        {!periods.length && (
          <EmptyState
            icon={<CalendarDays size={36} />}
            text={
              selectedForce
                ? "Lực lượng này chưa có giai đoạn. Hãy thêm giai đoạn đầu tiên."
                : "Hãy chọn quốc gia và lực lượng."
            }
          />
        )}
      </div>
      {periods.length > 0 && (
        <div className="flex justify-end">
          <NextButton label="Tiếp tục nhập nội dung" onClick={onNext} />
        </div>
      )}
      {showForm && (
        <Modal
          title={editing ? "Sửa giai đoạn" : "Thêm giai đoạn"}
          onClose={close}
        >
          <form onSubmit={save} className="space-y-5">
            <Field label="Tên giai đoạn *">
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border-2 border-brand-red/25 p-3"
                placeholder="Ví dụ: Kháng chiến chống Pháp (1945-1954)"
              />
            </Field>
            <Field label="Đoạn giới thiệu trên trang showcase">
              <textarea
                placeholder="Nội dung này xuất hiện ngay dưới tiêu đề giai đoạn."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-28 w-full rounded-xl border-2 border-brand-red/25 p-3"
              />
            </Field>
            <ModalActions
              onCancel={close}
              saving={saving}
              label="Lưu giai đoạn"
            />
          </form>
        </Modal>
      )}
      {deleting && (
        <ConfirmModal
          message={`Xóa giai đoạn “${deleting.categoryName}”? Chỉ xóa được khi chưa có nội dung phục dựng sử dụng giai đoạn này.`}
          onCancel={() => setDeleting(null)}
          onConfirm={remove}
        />
      )}
    </section>
  );
}

function ContentStep({
  countries,
  forces,
  selectedCountryId,
}: {
  countries: Country[];
  forces: Force[];
  selectedCountryId: number | null;
}) {
  const selectedCountry = countries.find(
    (country) => Number(country.id) === selectedCountryId,
  );
  const countryForces = forces.filter(
    (force) => Number(force.countryId) === Number(selectedCountryId),
  );
  return (
    <section className="space-y-5">
      <SectionIntro
        number="Bước 4"
        title="Nhập nội dung, giai đoạn và ảnh"
        description="Mỗi nội dung sẽ được gắn với một quốc gia, một lực lượng và một giai đoạn. Ảnh tải lên sẽ xuất hiện tại trang chi tiết đúng theo ba điều kiện đó."
      />
      <div className="grid gap-3 rounded-2xl border border-brand-yellow/40 bg-[#fff9e7] p-5 text-sm text-brand-text/80 md:grid-cols-3">
        <span>
          <CheckCircle className="mr-2 inline text-green-600" size={18} />
          {countries.length} quốc gia
        </span>
        <span>
          <CheckCircle className="mr-2 inline text-green-600" size={18} />
          {countryForces.length} lực lượng của quốc gia này
        </span>
        <span>
          <CheckCircle className="mr-2 inline text-green-600" size={18} />
          Đang nhập cho:{" "}
          <strong>{selectedCountry?.countryName || "chọn quốc gia"}</strong>
        </span>
      </div>
      <UniformManager
        embedded
        categoryType="REENACTMENT"
        initialCountryId={selectedCountryId || undefined}
        title="Danh sách nội dung phục dựng"
        editPathPrefix="/admin/phuc-dung/noi-dung/edit"
      />
    </section>
  );
}

function SectionIntro({
  number,
  title,
  description,
  action,
}: {
  number: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-3xl border border-brand-red/15 bg-white p-6 shadow-sm md:flex-row md:items-center">
      <div>
        <p className="mb-1 text-sm font-bold uppercase tracking-widest text-brand-red">
          {number}
        </p>
        <h2 className="font-display text-2xl font-black uppercase text-brand-redDark">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-brand-text/65">{description}</p>
      </div>
      {action}
    </div>
  );
}
function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="col-span-full flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-red/20 bg-white p-6 text-center text-brand-text/55">
      {icon}
      <p className="mt-3 max-w-md">{text}</p>
    </div>
  );
}
function NextButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-brand-red bg-white px-5 py-3 font-bold text-brand-red hover:bg-red-50"
    >
      {label}
      <ArrowRight size={18} />
    </button>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-bold text-brand-text">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-4 border-brand-yellow/30 bg-white p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-brand-red/15 pb-4">
          <h2 className="font-display text-2xl font-black uppercase text-brand-redDark">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-brand-text hover:bg-brand-bg hover:text-brand-red"
          >
            <X size={25} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function ModalActions({
  onCancel,
  saving,
  label,
}: {
  onCancel: () => void;
  saving: boolean;
  label: string;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-brand-red/15 pt-5">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl px-5 py-3 font-bold text-brand-text hover:bg-brand-bg"
      >
        Hủy
      </button>
      <button
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-6 py-3 font-bold text-white hover:bg-brand-redDark disabled:opacity-50"
      >
        {saving && <Loader2 size={18} className="animate-spin" />}
        {label}
      </button>
    </div>
  );
}
function ConfirmModal({
  message,
  onCancel,
  onConfirm,
}: {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
        <AlertCircle className="mx-auto mb-3 text-brand-red" size={34} />
        <p className="leading-6 text-brand-text">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl px-5 py-3 font-bold hover:bg-brand-bg"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-brand-red px-5 py-3 font-bold text-white hover:bg-brand-redDark"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
