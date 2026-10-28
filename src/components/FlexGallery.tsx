import SensitiveImage from "./SensitiveImage";
import { galleryRows } from "@/utils/galleryRows";

export type GalleryImage = { id: number; imageUrl?: string | null; description?: string; sensitive?: boolean; displayMode?: "GRID" | "FULL" };

export default function FlexGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  return <div className="space-y-5">{galleryRows(images).map((row) => <div key={row[0].id}
    className={`grid gap-5 ${row.length === 1 ? "grid-cols-1" : row.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
    {row.map((image) => <figure key={image.id} className="min-w-0">
      <SensitiveImage src={image.imageUrl || undefined} sensitive={Boolean(image.sensitive)} alt={image.description || title}
        className={`w-full object-contain ${row.length === 1 ? "max-h-[760px]" : "aspect-[3/4]"}`} />
      {image.description && <figcaption className="bg-[#f1f1f1] px-3 py-2 text-center text-sm italic leading-6">{image.description}</figcaption>}
    </figure>)}
  </div>)}</div>;
}
