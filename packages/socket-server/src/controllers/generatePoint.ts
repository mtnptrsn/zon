import { getDistance } from "geolib";
import { getStreetCoordinates } from "../utils/osm";

// generate random number between min and max
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generatePoint = async (
  start: [number, number],
  distance: number
) => {
  const streetCoordinates = await getStreetCoordinates(start, distance + 200);

  if (!streetCoordinates) return [0, 0];

  const compatibleCoordinates = streetCoordinates.filter((coordinate) => {
    const _distance = getDistance(start, coordinate);
    return _distance > distance - 200 && _distance < distance + 200;
  });

  return compatibleCoordinates[
    randomNumber(0, compatibleCoordinates.length - 1)
  ];
};
