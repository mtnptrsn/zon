import {Coordinate} from './types';

export const getBounds = (coordinates: Coordinate[], padding: number) => {
  const minLatitude = coordinates.reduce<any>((acc, coordinate) => {
    const [_, latitude] = coordinate;
    if (acc === null) return latitude;
    if (acc! > latitude) return latitude;

    return acc;
  }, null);

  const minLongitude = coordinates.reduce<any>((acc, coordinate) => {
    const [longitude] = coordinate;
    if (acc === null) return longitude;
    if (acc! > longitude) return longitude;

    return acc;
  }, null);

  const maxLatitude = coordinates.reduce<any>((acc, coordinate) => {
    const [_, latitude] = coordinate;
    if (acc === null) return latitude;
    if (acc! < latitude) return latitude;

    return acc;
  }, null);

  const maxLongitude = coordinates.reduce<any>((acc, coordinate) => {
    const [longitude] = coordinate;
    if (acc === null) return longitude;
    if (acc! < longitude) return longitude;

    return acc;
  }, null);

  return {
    ne: [maxLongitude, maxLatitude],
    sw: [minLongitude, minLatitude],
    paddingLeft: padding,
    paddingRight: padding,
    paddingBottom: padding,
    paddingTop: padding,
  };
};
