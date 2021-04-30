import to from "await-to-js";
import axios from "axios";
import { getDistance } from "geolib";
import { parseStringPromise } from "xml2js";

const getOverpassQuery = (coordinate: [number, number], radius: number) => {
  return `<?xml version="1.0" encoding="UTF-8"?><osm-script><query type="way"><around lat="${
    coordinate[1]
  }" lon="${coordinate[0]}" radius="${
    radius * 3
  }"/><has-kv k="highway" /></query><union><item/><recurse type="down"/></union><print/></osm-script>`;
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

  return parsedData.osm.node
    .map((node: any) => [node.$.lon, node.$.lat])
    .filter((coordinate: [number, number]) => {
      const distance = getDistance(
        { lon: coordinate[0], lat: coordinate[1] },
        { lon: center[0], lat: center[1] }
      );
      return distance <= radius;
    });
};
