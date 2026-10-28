export function galleryRows<T extends { displayMode?: "GRID" | "FULL" }>(images: T[]): T[][] {
  const rows: T[][] = [];
  let pending: T[] = [];
  const flush = () => { if (pending.length) { rows.push(pending); pending = []; } };
  for (const image of images) {
    if (image.displayMode === "FULL") { flush(); rows.push([image]); }
    else { pending.push(image); if (pending.length === 3) flush(); }
  }
  flush();
  return rows;
}
