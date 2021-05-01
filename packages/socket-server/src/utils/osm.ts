import to from "await-to-js";
import axios from "axios";
import {
  computeDestinationPoint,
  getDistance,
  getRhumbLineBearing,
} from "geolib";
import { parseStringPromise } from "xml2js";

const getOverpassQuery = (coordinate: [number, number], radius: number) => {
  return `<?xml version="1.0" encoding="UTF-8"?><osm-script><query type="way"><around lat="${
    coordinate[1]
  }" lon="${coordinate[0]}" radius="${
    radius * 3
  }"/><has-kv k="highway" /></query><union><item/><recurse type="down"/></union><print/></osm-script>`;
};

const populateWay = (way: [number, number][], margin: number) => {
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
) => {
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
  if (err) return null;

  const parsedData = await parseStringPromise(response!.data);

  let nodes: [number, number][] = [];
  const nodeSet = parsedData.osm.node.reduce((acc: any, node: any) => {
    return {
      ...acc,
      [node.$.id]: [node.$.lon, node.$.lat],
    };
  }, {});
  const ways: [number, number][][] = parsedData.osm.way.map((way: any) => {
    const nodes = way.nd.map((node: any) => {
      const nodeId = node.$.ref;
      return nodeSet[nodeId];
    });
    return nodes;
  });
  ways.forEach((way) => (nodes = [...nodes, ...populateWay(way, 50)]));
  return nodes.filter((coordinate: [number, number]) => {
    const distance = getDistance(
      { lon: coordinate[0], lat: coordinate[1] },
      { lon: center[0], lat: center[1] }
    );
    return distance <= radius;
  });
};
