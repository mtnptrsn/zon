import {useEffect, useState} from 'react';
import Geolocation, {
  GeolocationOptions,
  GeolocationResponse,
} from '@react-native-community/geolocation';

let watchId = 0;

export const getInitialPosition = () => ({
  coords: {
    accuracy: 0,
    altitude: 0,
    altitudeAccuracy: 0,
    heading: 0,
    latitude: 0,
    longitude: 0,
    speed: 0,
  },
  timestamp: 0,
});

export const usePosition = (options: GeolocationOptions) => {
  const [state, setState] = useState<GeolocationResponse>(getInitialPosition());

  const onPositionUpdate = (response: GeolocationResponse) => {
    setState(response);
  };

  useEffect(() => {
    watchId = Geolocation.watchPosition(onPositionUpdate, () => {}, options);
    return () => Geolocation.clearWatch(watchId);
  }, []);

  return state;
};
