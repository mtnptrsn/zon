import { getDistance } from "geolib";

export const getPenalty = (player: any, room: any) => {
  const playerLocation = player.location.coordinates;
  const homes = room.map.homes.map((home: any) => home.location.coordinates);

  const closestHome = homes.reduce(
    (acc: any, current: any) => {
      const previousDistance = acc[1];
      const currentDistance = getDistance(playerLocation, current);
      if (currentDistance < previousDistance) return [current, currentDistance];
      return acc;
    },
    [homes[0], getDistance(playerLocation, homes[0])]
  );

  const distanceFromHome = closestHome[1];

  return Math.min(
    player.score,
    Math.round(player.score * (distanceFromHome / room.map.radius))
  );
};
