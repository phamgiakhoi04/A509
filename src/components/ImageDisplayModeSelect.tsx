export type ImageDisplayMode = "GRID" | "FULL";
export default function ImageDisplayModeSelect({ value, onChange }: { value?: ImageDisplayMode; onChange: (value: ImageDisplayMode) => void }) {
  return <label className="relative z-20 mt-2 block text-left text-xs font-semibold" onClick={(event) => event.stopPropagation()}>
    Bố cục ảnh
    <select value={value || "GRID"} onChange={(event) => onChange(event.target.value as ImageDisplayMode)} className="mt-1 w-full border border-[#bbb] bg-white p-2 text-sm">
      <option value="GRID">Trong hàng 3 ảnh</option><option value="FULL">Toàn hàng</option>
    </select>
  </label>;
}
