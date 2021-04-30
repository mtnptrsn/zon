import { getDistance } from "geolib";
import { gameConfig } from "shared/config/game";

export const generateMap = (
  coordinates: [number, number][],
  radius: number
): [number, number][] => {
  const margin = gameConfig.hitbox.point * 2 + 25;
  const amountOfPoints = Math.ceil((Math.PI * Math.pow(radius, 2)) / 200000);

  let points: [number, number][] = [];

  for (let i = 0; i < coordinates.length; i++) {
    const coordinate = coordinates[i];
    const distanceFromNearestPoint = points.reduce(
      (acc: number, point: [number, number]) => {
        const distance = getDistance(
          { lng: point[0], lat: point[1] },
          { lng: coordinate[0], lat: coordinate[1] }
        );
        if (acc === -1 || distance < acc) return distance;
        return acc;
      },
      -1
    );

    const isValid = distanceFromNearestPoint > margin;

    if (isValid || distanceFromNearestPoint === -1)
      points = [...points, coordinate];
    if (points.length >= amountOfPoints) break;
  }

  return points;
};
