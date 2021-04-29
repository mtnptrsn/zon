export const getMarkerSize = (
  latitude: number,
  zoom: number,
  hitbox: number,
  minSize: number,
) => {
  const mpp =
    (78271.5169648 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
  const ppm = Math.pow(mpp, -1);
  const size = Math.max(minSize, ppm * hitbox * 2);
  return size;
};
