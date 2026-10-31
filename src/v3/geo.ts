// Web Mercator ở zoom 0: cả thế giới là hình vuông 256×256 (khớp scripts/make-map-data.py).
export const project = (lon: number, lat: number) => {
  const s = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  return {
    x: ((lon + 180) / 360) * 256,
    y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 256,
  };
};

export type Camera = { lon: number; lat: number; zoom: number };

// Biến toạ độ bản đồ (zoom 0) thành toạ độ màn hình với tâm camera đặt tại (cx, cy).
export const cameraTransform = (cam: Camera, cx: number, cy: number) => {
  const k = 2 ** cam.zoom;
  const c = project(cam.lon, cam.lat);
  return { k, tx: cx - c.x * k, ty: cy - c.y * k };
};
