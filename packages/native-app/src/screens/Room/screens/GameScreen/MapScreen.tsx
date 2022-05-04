import {GeolocationResponse} from '@react-native-community/geolocation';
import MapBoxGL from '@rnmapbox/maps';
import useInterval from '@use-it/interval';
import {differenceInMilliseconds} from 'date-fns';
import {getDistance} from 'geolib';
import React, {FC, useMemo, useRef, useState} from 'react';
import {StyleSheet} from 'react-native';
import {MAP_TILES_TOKEN} from 'react-native-dotenv';
import {Colors, View} from 'react-native-ui-lib';
import TinyColor from 'tinycolor2';
import {gameConfig} from '../../../../config/game';
import {getPointRadius} from '../../../../utils/map';
import MockUserLocation from '../../../TutorialScreen/MockUserLocation';
import Compass from '../../components/Compass';
import Score from '../../components/Score';
import TimeLeft from '../../components/TimeLeft';

const minZoomLevel = 11;
const maxZoomLevel = 19;

interface IMapScreenProps {
  room: any;
  position: GeolocationResponse;
  player: any;

  onPressMap: (coordinate: [number, number]) => void;

  zoomEnabled: boolean;
  usePositionAsCenter: boolean;
}

const useForceUpdate = () => {
  const [_, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markerText: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 3,
  },
});

const getPenalty = (player: any, room: any) => {
  const playerLocation = player.location.coordinates;
  const homes = room.map.homes.map((home: any) => home.location.coordinates);

  const closestHome = homes.reduce(
    (acc: any, current: any) => {
      const previousDistance = acc[1];
      const currentDistance = getDistance(playerLocation, current);
      if (currentDistance < previousDistance) return [current, currentDistance];
      return acc;
    },
    [homes[0], getDistance(playerLocation, homes[0])],
  );

  const distanceFromHome = closestHome[1];

  return Math.min(
    player.score,
    Math.round(player.score * (distanceFromHome / room.map.radius)),
  );
};

const getPointColor = (point: any, players: any[]) => {
  if (point.captures.length === 0)
    return new TinyColor(Colors.green30).setAlpha(0.8).toRgbString();

  const lastCapture = point.captures[point.captures.length - 1];
  const owner = players.find(
    (player: any) => player._id === lastCapture.playerId,
  );
  return new TinyColor(owner.color).setAlpha(0.8).toRgbString();
};

const MapScreen: FC<IMapScreenProps> = props => {
  const isHardMode = 'HARDMODE' in props.room.flags;
  const update = useForceUpdate();

  // // TODO: Remove this after db refactor
  useInterval(() => {
    update();
  }, 3000);

  const penalty = getPenalty(props.player, props.room);

  const mapStyles = {
    pointCircle: {
      circleRadius: [
        'interpolate',
        ['exponential', 2],
        ['zoom'],
        minZoomLevel,
        ['get', 'minSize'],
        maxZoomLevel,
        ['get', 'maxSize'],
      ],
      circleColor: ['get', 'color'],
      circleStrokeWidth: 2,
      circleStrokeColor: 'white',
    },
  };

  const points = {
    type: 'FeatureCollection',
    features: [...props.room.map.homes, ...props.room.map.points].map(
      (point: any) => {
        const isHome = !point.weight;

        const lastCapture = point.captures?.[point.captures.length - 1];

        const isLocked =
          Boolean(lastCapture?.createdAt) &&
          differenceInMilliseconds(
            new Date(),
            new Date(lastCapture?.createdAt),
          ) < gameConfig.durations.zoneLockedAfterCapture;

        // const text = isHome ? '' : isLocked ? 'L' : point.weight;

        const textSizes = {
          min: 11,
          max: 200,
        };

        return {
          type: 'Feature',
          id: point.location.coordinates.join(','),
          properties: {
            color: isHome
              ? new TinyColor(Colors.blue30).setAlpha(0.4).toRgbString()
              : getPointColor(point, props.room.players),
            minSize: Math.max(
              getPointRadius(
                props.position.coords.latitude,
                minZoomLevel,
                isHome ? gameConfig.hitbox.home : gameConfig.hitbox.point,
              ),
              7,
            ),
            maxSize: getPointRadius(
              props.position.coords.latitude,
              maxZoomLevel,
              isHome ? gameConfig.hitbox.home : gameConfig.hitbox.point,
            ),
            textSizeMin: textSizes.min,
            textSizeMax: textSizes.max,
          },
          geometry: {
            type: 'Point',
            coordinates: point.location.coordinates,
          },
        };
      },
    ),
  };

  return (
    <View style={styles.container}>
      <MapBoxGL.MapView
        styleURL={`https://api.maptiler.com/maps/2859be49-5e41-4173-9bfe-9fa85ea4bb1d/style.json?key=${MAP_TILES_TOKEN}`}
        onPress={e => props.onPressMap(e.geometry.coordinates)}
        style={{flex: 1}}
        logoEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        zoomEnabled={props.zoomEnabled}>
        <MapBoxGL.Camera
          // followUserLocation={!props.usePositionAsCenter}
          minZoomLevel={minZoomLevel}
          maxZoomLevel={maxZoomLevel}
          defaultSettings={{
            zoomLevel: 14,
            centerCoordinate: [
              props.position.coords.longitude,
              props.position.coords.latitude,
            ],
          }}
          followZoomLevel={14}
          animationDuration={50}
        />
        <MapBoxGL.ShapeSource shape={points} id="points">
          <MapBoxGL.CircleLayer
            id="circleRadius"
            sourceLayerID="circleRadius"
            style={mapStyles.pointCircle as any}
          />
        </MapBoxGL.ShapeSource>
      </MapBoxGL.MapView>

      {/* <TimeLeft finishedAt={new Date(props.room.finishedAt)} /> */}

      <Compass />
    </View>
  );
};

export default MapScreen;
