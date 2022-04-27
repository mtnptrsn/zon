import ms from 'ms';

export const gameConfig = {
  hitbox: {
    home: 30,
    point: 30,
  },
  durations: {
    start: ms('5s'),
    promptEnd: ms('5s'),
    zoneLockedAfterCapture: ms('1m'),
  },
};
