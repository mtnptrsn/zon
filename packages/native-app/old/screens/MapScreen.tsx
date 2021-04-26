import React, {useEffect, useState, FC, useRef, useContext} from 'react';
import {View, Text, ScrollView, Switch} from 'react-native';
import MapBoxGL from '@react-native-mapbox-gl/maps';
import GeoLocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';
import {getDistance} from 'geolib';
import {GeolibInputCoordinates} from 'geolib/es/types';
import Sound from 'react-native-sound';
import {GlobalStateContext} from '../contexts';
import {useRoute} from '@react-navigation/native';

const hitBox = 10;
const dingSound = new Sound('ding.mp3', Sound.MAIN_BUNDLE);

class Coordinate {
  latitude = 0;
  longitude = 0;

  constructor(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  toMapBoxGLCoordinate = () => {
    return [this.longitude, this.latitude];
  };

  toGeoLibInputCoordinate = (): GeolibInputCoordinates => {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
    };
  };

  toString = () => `${this.latitude},${this.longitude}`;
}

MapBoxGL.setAccessToken(
  'pk.eyJ1IjoibXRucHRyc24iLCJhIjoiY2tuN3JkdmNuMGFyYjJ1bXFsZHFvZnZyaiJ9._8xfeiMfcT5cTsfo-QY94w',
);

//const coordinates = [
//new Coordinate(56.549868380401634, 16.18111817523243),
//new Coordinate(56.55382860559767, 16.181065643491124),
//];

const getMapBoxGLBounds = (coordinates: Coordinate[]) => {
  const minLatitude = coordinates.reduce<any>((acc, coordinate) => {
    if (acc === null) return coordinate.latitude;
    if (acc! > coordinate.latitude) return coordinate.latitude;

    return acc;
  }, null);

  const minLongitude = coordinates.reduce<any>((acc, coordinate) => {
    if (acc === null) return coordinate.longitude;
    if (acc! > coordinate.longitude) return coordinate.longitude;

    return acc;
  }, null);

  const maxLatitude = coordinates.reduce<any>((acc, coordinate) => {
    if (acc === null) return coordinate.latitude;
    if (acc! < coordinate.latitude) return coordinate.latitude;

    return acc;
  }, null);

  const maxLongitude = coordinates.reduce<any>((acc, coordinate) => {
    if (acc === null) return coordinate.longitude;
    if (acc! < coordinate.longitude) return coordinate.longitude;

    return acc;
  }, null);

  const padding = 50;

  return {
    ne: new Coordinate(maxLatitude, maxLongitude).toMapBoxGLCoordinate(),
    sw: new Coordinate(minLatitude, minLongitude).toMapBoxGLCoordinate(),
    paddingLeft: padding,
    paddingRight: padding,
    paddingBottom: padding,
    paddingTop: padding,
  };
};

const scanDataToPoints = (scanData: string) => {
  return scanData.split(';').map(coordinateString => {
    const [long, lat] = coordinateString.split(',');
    return new Coordinate(Number(lat), Number(long));
  });
};

const MapScreen: FC = () => {
  const route = useRoute();

  const state = useContext(GlobalStateContext);
  const [pointsCollected, setPointsCollected] = useState([]);
  const points = scanDataToPoints((route.params as any).scan as string);

  const onChangePosition = (response: GeolocationResponse) => {
    state.logs.set([...state.logs.get(), 'onChangePosition']);

    const currentLocation = new Coordinate(
      response.coords.latitude,
      response.coords.longitude,
    );

    const distances = points.map(coordinate => {
      return String(
        'Coordinate: ' +
          getDistance(
            coordinate.toGeoLibInputCoordinate(),
            currentLocation.toGeoLibInputCoordinate(),
          ),
      );
    });

    state.logs.set([...state.logs.get(), ...distances]);

    const newPointsCollected = points.filter(coordinate => {
      const distance = getDistance(
        coordinate.toGeoLibInputCoordinate(),
        currentLocation.toGeoLibInputCoordinate(),
      );
      return (
        distance < hitBox && !(pointsCollected as any)[coordinate.toString()]
      );
    });

    if (newPointsCollected.length) dingSound.play();

    setPointsCollected({
      ...pointsCollected,
      ...newPointsCollected.reduce((acc, coordinate) => {
        return {
          ...acc,
          [coordinate.toString()]: true,
        };
      }, {}),
    });
  };

  const savedOnChangePosition = useRef(onChangePosition);

  useEffect(() => {
    savedOnChangePosition.current = onChangePosition;
  }, [onChangePosition, state.logs, pointsCollected]);

  useEffect(() => {
    GeoLocation.watchPosition(
      response => savedOnChangePosition.current(response),
      () => {},
      {
        distanceFilter: 5,
        enableHighAccuracy: true,
      },
    );
  }, []);

  return (
    <View style={{flex: 1}}>
      <MapBoxGL.MapView
        style={{flex: 1}}
        pitchEnabled={false}
        rotateEnabled={false}>
        <MapBoxGL.Camera
          animationDuration={0}
          bounds={getMapBoxGLBounds(points)}
        />

        {state.showCurrentLocation.get() && <MapBoxGL.UserLocation />}

        {points.map(coordinate => {
          return (
            <MapBoxGL.MarkerView
              id={coordinate.toString()}
              key={coordinate.toString()}
              coordinate={coordinate.toMapBoxGLCoordinate()}>
              <View
                style={{
                  borderRadius: 99,
                  width: 20,
                  height: 20,
                  borderWidth: 3,
                  borderStyle: 'solid',
                  borderColor: 'white',
                  backgroundColor: (pointsCollected as any)[
                    coordinate.toString()
                  ]
                    ? '#4CAF50'
                    : '#f44336',
                }}
              />
            </MapBoxGL.MarkerView>
          );
        })}
      </MapBoxGL.MapView>
    </View>
  );
};

export default MapScreen;
