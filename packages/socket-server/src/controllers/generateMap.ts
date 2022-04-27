import { getDistance } from "geolib";
import { generateMap } from "../utils/map";
import { getStreetCoordinates } from "../utils/osm";

const shuffle = (array: any[]) => {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

export const getMap = async (homes: [number, number][], radius: number) => {
  return (
    await Promise.all(
      homes.map(async (home) => {
        const streetCoordinates = await getStreetCoordinates(home, radius);
        const points = generateMap(shuffle(streetCoordinates!), radius, [home]);

        const map = points.map((coordinate) => {
          const distance = getDistance(
            // could be wrong order!
            home,
            coordinate
          );

          // TODO: Refactor
          // TODO: Improve this
          const max = 3;
          const dp = distance / radius;
          const randAdd = Math.pow(Math.random(), 2) * dp * max;
          const weight = Math.max(1, Math.floor(dp * max + randAdd));

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
