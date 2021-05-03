export const getPointRadius = (
  latitude: number,
  zoom: number,
  hitbox: number,
) => {
  const mpp =
    (78271.5169648 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
  const ppm = Math.pow(mpp, -1);
  return ppm * hitbox;
};
