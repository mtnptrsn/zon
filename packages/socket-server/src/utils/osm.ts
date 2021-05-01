import to from "await-to-js";
import axios from "axios";
import {
  computeDestinationPoint,
  getDistance,
  getRhumbLineBearing,
} from "geolib";
import { parseStringPromise } from "xml2js";

const getOverpassQuery = (coordinate: [number, number], radius: number) => {
  return `<?xml version="1.0" encoding="UTF-8"?><osm-script><query type="way"><around lat="${coordinate[1]}" lon="${coordinate[0]}" radius="${radius}"/><has-kv k="highway" /></query><union><item/><recurse type="down"/></union><print/></osm-script>`;
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
  if (err) return null;
  // console.timeEnd("gsc:fetch");

  const parsedData = await parseStringPromise(response!.data);

  let nodes: [number, number][] = [];
  // console.time("gsc:getReferences");
  const ways: [number, number][][] = parsedData.osm.way.map((way: any) => {
    const nodes = way.nd.map((nodeRef: any) => {
      const nodeId = nodeRef.$.ref;
      const node = parsedData.osm.node.find(
        (node: any) => node.$.id === nodeId
      );
      return [node.$.lon, node.$.lat];
    });
    return nodes;
  });
  // console.timeEnd("gsc:getReferences");
  // console.time("gsc:populateWay");
  ways.forEach((way) => (nodes = [...nodes, ...populateWay(way, 30)]));
  // console.timeEnd("gsc:populateWay");
  return nodes.filter((coordinate: [number, number]) => {
    const distance = getDistance(
      { lon: coordinate[0], lat: coordinate[1] },
      { lon: center[0], lat: center[1] }
    );
    return distance <= radius;
  });
};
