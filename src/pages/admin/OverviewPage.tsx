import { useEffect, useState } from "react";
import { Activity, Users, Eye, Globe, FileText, RefreshCw } from "lucide-react";
import axiosClient from "@/api/axiosClient";
import { apiError } from "@/utils/apiError";
type Group = { label: string; total: number }[];
type Overview = {
  days: number;
  users: number;
  activeUsers: number;
  newUsers: number;
  publishedArticles: number;
  uniforms: number;
  pageviews: number;
  sessions: number;
  visitors: number;
  locationConfigured: boolean;
  retentionDays: number;
  daily: { day: string; views: number; sessions: number; users: number }[];
  device: Group;
  country: Group;
  region: Group;
  referrer: Group;
  path: Group;
};
const number = (n: number) => n.toLocaleString("vi-VN");
export default function OverviewPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    axiosClient
      .get("/api/admin/overview", { params: { days }, signal: abort.signal })
      .then((r) => setData(r.data))
      .catch((e) => {
        if (!abort.signal.aborted)
          setError(apiError(e, "Không tải được số liệu tổng quan."));
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [days, refresh]);
  return (
    <main className="admin-page mx-auto max-w-7xl space-y-6 p-5 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gray-500">
            A509 · Quản trị
          </p>
          <h1 className="mt-2 text-3xl font-bold text-brand-red">
            Tổng quan hoạt động
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Dữ liệu thực · Ngày thống kê theo UTC
          </p>
        </div>
        <div className="flex gap-3">
          <select
            aria-label="Khoảng thời gian"
            className="rounded-lg border bg-white p-3"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={90}>90 ngày</option>
          </select>
          <button
            aria-label="Làm mới"
            disabled={loading}
            className="rounded-lg border bg-white p-3 disabled:opacity-40"
            onClick={() => setRefresh((n) => n + 1)}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"
        >
          {error}
          <button
            className="ml-4 underline"
            onClick={() => setRefresh((n) => n + 1)}
          >
            Thử lại
          </button>
        </div>
      )}
      {loading ? (
        <p role="status" className="py-16 text-center text-gray-500">
          Đang tải số liệu...
        </p>
      ) : (
        data &&
        !error && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Người dùng",
                  value: data.users,
                  detail: `${number(data.activeUsers)} đang hoạt động · +${number(data.newUsers)} trong kỳ`,
                  icon: Users,
                },
                {
                  label: "Lượt xem trang",
                  value: data.pageviews,
                  detail: `Trong ${days} ngày đã chọn`,
                  icon: Eye,
                },
                {
                  label: "Khách truy cập",
                  value: data.visitors,
                  detail: "Trình duyệt riêng biệt (ước tính)",
                  icon: Globe,
                },
                {
                  label: "Phiên truy cập",
                  value: data.sessions,
                  detail: "Phiên mới sau 30 phút không hoạt động",
                  icon: Activity,
                },
              ].map((card) => (
                <article
                  key={card.label}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex justify-between text-gray-500">
                    <h2 className="text-sm font-medium">{card.label}</h2>
                    <card.icon size={20} />
                  </div>
                  <p className="my-3 text-3xl font-bold text-gray-900">
                    {number(card.value)}
                  </p>
                  <p className="text-xs text-gray-500">{card.detail}</p>
                </article>
              ))}
            </div>
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">Xu hướng truy cập</h2>
              <p className="mt-1 text-sm text-gray-500">
                Lượt xem và phiên truy cập mỗi ngày
              </p>
              <p className="mt-4 flex gap-5 text-xs">
                <span className="text-brand-red">● Lượt xem</span>
                <span className="text-blue-600">● Phiên truy cập</span>
              </p>
              <Trend points={data.daily} />
            </section>
            <div className="grid gap-5 lg:grid-cols-2">
              <Breakdown
                title="Thiết bị"
                data={data.device}
                labels={{
                  phone: "Điện thoại",
                  desktop: "Máy tính",
                  tablet: "Máy tính bảng",
                }}
              />
              <Breakdown
                title="Nguồn truy cập"
                data={data.referrer}
                labels={{ direct: "Trực tiếp / Không xác định" }}
              />
              <Breakdown
                title="Quốc gia"
                data={data.country}
                labels={{ ZZ: "Chưa xác định" }}
              />
              <Breakdown
                title="Khu vực"
                data={data.region}
                labels={{ Unknown: "Chưa xác định" }}
              />
            </div>
            {!data.locationConfigured && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Chưa cấu hình nguồn vị trí từ proxy tin cậy. Các lượt truy cập
                hiện được ghi là “Chưa xác định”; website không đoán vị trí hoặc
                gửi IP tới dịch vụ bên ngoài.
              </p>
            )}
            <div className="grid gap-5 lg:grid-cols-2">
              <Breakdown title="Trang được xem nhiều" data={data.path} />
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <FileText size={20} /> Nội dung & người dùng
                </h2>
                <dl className="mt-5 space-y-4">
                  <Row
                    label="Bài viết đã xuất bản"
                    value={data.publishedArticles}
                  />
                  <Row
                    label="Nội dung quân trang / phục dựng"
                    value={data.uniforms}
                  />
                  <Row
                    label={`Tài khoản mới (${days} ngày)`}
                    value={data.newUsers}
                  />
                </dl>
                <Trend points={data.daily} account />
              </section>
            </div>
            <p className="text-xs leading-5 text-gray-500">
              Thống kê bắt đầu từ khi bật tính năng, lưu tối đa{" "}
              {data.retentionDays} ngày. Khách được phân biệt bằng mã ngẫu nhiên
              trong trình duyệt; không lưu IP, truy vấn tìm kiếm hoặc liên kết
              đặt lại mật khẩu. Người chặn theo dõi, bot và trang quản trị được
              bỏ qua. Đây là thống kê đo được, không phải số người tuyệt đối.
            </p>
          </>
        )
      )}
    </main>
  );
}
function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-3 text-sm">
      <dt>{label}</dt>
      <dd className="font-bold">{number(value)}</dd>
    </div>
  );
}
function Breakdown({
  title,
  data,
  labels = {},
}: {
  title: string;
  data: Group;
  labels?: Record<string, string>;
}) {
  const max = Math.max(1, ...data.map((r) => r.total));
  return (
    <section className="min-w-0 rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      {!data.length ? (
        <p className="py-10 text-sm text-gray-500">
          Chưa có dữ liệu truy cập trong kỳ này.
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {data.map((row) => (
            <li key={row.label}>
              <div className="mb-2 flex justify-between gap-3 text-sm">
                <span className="min-w-0 break-all">
                  {labels[row.label] || row.label}
                </span>
                <span className="font-bold">{number(row.total)}</span>
              </div>
              <div className="h-2 rounded bg-gray-100" aria-hidden="true">
                <div
                  className="h-full rounded bg-brand-red"
                  style={{ width: `${(row.total / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
function Trend({
  points,
  account = false,
}: {
  points: Overview["daily"];
  account?: boolean;
}) {
  const max = Math.max(
    1,
    ...points.map((p) => (account ? p.users : Math.max(p.views, p.sessions))),
  );
  const xy = (key: "views" | "sessions" | "users") =>
    points
      .map(
        (p, i) =>
          `${40 + (i * 710) / Math.max(1, points.length - 1)},${170 - (p[key] / max) * 140}`,
      )
      .join(" ");
  return (
    <>
      <svg
        role="img"
        aria-label={
          account
            ? "Tài khoản đăng ký mới theo ngày"
            : "Biểu đồ lượt xem màu đỏ, phiên truy cập màu xanh"
        }
        viewBox="0 0 800 220"
        className="mt-4 w-full"
      >
        <title>
          {account ? "Tài khoản mới" : "Lượt xem và phiên truy cập"}
        </title>
        {[0, 0.5, 1].map((n) => (
          <g key={n}>
            <line
              x1="40"
              x2="750"
              y1={170 - n * 140}
              y2={170 - n * 140}
              stroke="#eee"
            />
            <text x="4" y={175 - n * 140} fontSize="12" fill="#666">
              {Math.round(max * n)}
            </text>
          </g>
        ))}
        <polyline
          points={xy(account ? "users" : "views")}
          fill="none"
          stroke="#b51f24"
          strokeWidth="3"
        />
        {!account && (
          <polyline
            points={xy("sessions")}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
          />
        )}
        <text x="40" y="205" fontSize="12" fill="#666">
          {points[0]?.day}
        </text>
        <text x="750" y="205" textAnchor="end" fontSize="12" fill="#666">
          {points.at(-1)?.day}
        </text>
      </svg>
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer">Xem bảng số liệu</summary>
        <div className="mt-3 max-h-52 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Ngày UTC</th>
                <th>Lượt xem</th>
                <th>Phiên</th>
                <th>Tài khoản mới</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.day}>
                  <td>{p.day}</td>
                  <td>{p.views}</td>
                  <td>{p.sessions}</td>
                  <td>{p.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
