import to from "await-to-js";
import axios from "axios";
import {
  computeDestinationPoint,
  getDistance,
  getRhumbLineBearing,
} from "geolib";

const getOverpassQuery = (coordinate: [number, number], radius: number) => {
  return `
    [out:json][timeout:25];
    way["highway"]["highway"!="motorway"](around:${radius},${coordinate[1]},${coordinate[0]});
    out skel qt; 
    >;
    out skel qt;
  `;
};

const generateNodesBetween = (way: [number, number][], margin: number) => {
  let points: [number, number][] = [];
  way.forEach((point, index) => {
    const isLast = index === way.length - 1;
    if (isLast) points = [...points, point];
    else {
      points = [...points, point];
      const nextPoint = way[index + 1];
      const distance = getDistance(
        { lng: point[0], lat: point[1] },
        { lng: nextPoint[0], lat: nextPoint[1] }
      );
      const bearing = getRhumbLineBearing(
        { lon: point[0], lat: point[1] },
        { lon: nextPoint[0], lat: nextPoint[1] }
      );
      const numberOfNewPoints = Math.floor(distance / margin);

      for (let i = 0; i < numberOfNewPoints; i++) {
        const generatedPoint = computeDestinationPoint(
          { lon: point[0], lat: point[1] },
          margin * i,
          bearing
        );
        points = [
          ...points,
          [generatedPoint.longitude, generatedPoint.latitude],
        ];
      }
    }
  });
  return points;
};

export const getStreetCoordinates = async (
  center: [number, number],
  radius: number
): Promise<[number, number][] | null> => {
  // console.time("gsc:fetch");
  const [err, response] = await to(
    axios.post(
      `https://overpass-api.de/api/interpreter`,
      getOverpassQuery(center, radius),
      {
        headers: {
          "Content-Type": "application/xml",
        },
      }
    )
  );

  // console.log(getOverpassQuery(center, radius));

  // console.timeEnd("gsc:fetch");

  if (err) return null;

  const nodeMap = new Map<string, [number, number]>(
    response!.data.elements
      .filter((element: any) => element.type === "node")
      .map((element: any) => {
        return [element.id, [element.lon, element.lat]];
      })
  );

  return (
    response!.data.elements
      .filter((element: any) => element.type === "way")
      // Populate node references
      .map((way: any) =>
        way.nodes.map((nodeId: string) => nodeMap.get(nodeId)!)
      )
      // Generate nodes between nodes that are far apart
      .reduce((acc: [number, number][][], way: [number, number][]) => {
        return [...acc, ...generateNodesBetween(way, 10)];
      }, [])
      // Filter out nodes that are too far away. Ways can be further away
      // than the radius that is set in the overpass query. Therefore we need
      // to do this filtering.
      .filter((coordinate: [number, number]) => {
        const distance = getDistance(
          { lon: coordinate[0], lat: coordinate[1] },
          { lon: center[0], lat: center[1] }
        );
        return distance <= radius;
      })
  );
};
