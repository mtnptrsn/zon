// @ts-ignore
import randomLocation from "random-location";

export const generateMap = (
  center: [number, number],
  radius: number,
  amountOfPoints: number
): [number, number][] => {
  let points: [number, number][] = [];
  for (let i = 0; i < amountOfPoints; i++) {
    const randomPoint = randomLocation.randomCirclePoint(
      {
        longitude: center[0],
        latitude: center[1],
      },
      radius,
      Math.random
    );

    points = [...points, [randomPoint.longitude, randomPoint.latitude]];
  }
  return points;
};
