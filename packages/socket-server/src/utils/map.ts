import { getDistance } from "geolib";
// @ts-ignore
import randomLocation from "random-location";

export const generateMap = (
  center: [number, number],
  radius: number
): [number, number][] => {
  const amountOfPoints = Math.ceil((Math.PI * Math.pow(radius, 2)) / 180000);

  let points: [number, number][] = [];

  while (points.length < amountOfPoints) {
    const randomPoint = randomLocation.randomCirclePoint(
      {
        longitude: center[0],
        latitude: center[1],
      },
      radius,
      Math.random
    );

    const distanceFromNearestPoint = points.reduce(
      (acc: number, point: [number, number]) => {
        const distance = getDistance(
          { lng: point[0], lat: point[1] },
          { lng: randomPoint.longitude, lat: randomPoint.latitude }
        );
        if (acc === -1 || distance < acc) return distance;
        return acc;
      },
      -1
    );

    const margin = 200;

    if (distanceFromNearestPoint > margin || points.length === 0)
      points = [...points, [randomPoint.longitude, randomPoint.latitude]];
  }

  return points;
};
