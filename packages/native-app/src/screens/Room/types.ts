export type Coordinate = [number, number];

export interface IPlayer {
  _id: string;
  name: string;
  color: string;
  isHost: boolean;
}

export interface IPoint {
  location: {
    type: 'Point';
    coordinates: Coordinate;
  };
  weight: number;
}
