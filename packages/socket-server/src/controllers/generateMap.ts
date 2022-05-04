import { getDistance } from "geolib";
import { shuffle } from "../lib/shuffle";
import { generateMap } from "../utils/map";
import { getStreetCoordinates } from "../utils/osm";

export const getMap = async (
  homes: [number, number][],
  radius: number,
  controls: number
) => {
  return (
    await Promise.all(
      homes.map(async (home) => {
        const streetCoordinates = await getStreetCoordinates(home, radius);
        const points = generateMap(
          shuffle(streetCoordinates!),
          radius,
          [home],
          controls
        );

        const map = points.map((coordinate) => {
          const distance = getDistance(home, coordinate);
          const max = 3;
          const weight = Math.max(1, Math.ceil((distance / radius) * max));

          return {
            location: {
              type: "Point",
              coordinates: coordinate,
            },
            weight,
          };
        });

        return map;
      })
    )
  ).flat();
};
