import {GeolocationResponse} from '@react-native-community/geolocation';
import MapBoxGL from '@react-native-mapbox-gl/maps';
import useInterval from '@use-it/interval';
import {differenceInMilliseconds} from 'date-fns';
import React, {FC, useRef, useState} from 'react';
import {StyleSheet} from 'react-native';
import {Colors, View} from 'react-native-ui-lib';
import TinyColor from 'tinycolor2';
import {gameConfig} from '../../../../config/game';
import {getPointRadius} from '../../../../utils/map';
import HomeIndicator from '../../components/HomeIndicator';
import Score from '../../components/Score';
import TimeLeft from '../../components/TimeLeft';
import {IPoint} from '../../types';

const minZoomLevel = 13;
const maxZoomLevel = 19;

interface IMapScreenProps {
  room: any;
  position: GeolocationResponse;
  player: any;

  onPressMap: (coordinate: [number, number]) => void;
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

const getPointColor = (player: any, point: IPoint) => {
  if (point.collectedBy?.color)
    return new TinyColor(point.collectedBy.color).setAlpha(0.8).toRgbString();
  return new TinyColor(Colors.green30).setAlpha(0.8).toRgbString();
};

const MapScreen: FC<IMapScreenProps> = props => {
  const cameraRef = useRef(null);
  const isHardMode = props.room.flags.includes('HARDMODE');
  const update = useForceUpdate();

  // TODO: Remove this after db refactor
  useInterval(() => {
    update();
  }, 3000);

  const zoneScore = props.room.map.points.reduce((acc: number, point: any) => {
    return point.collectedBy?._id === props.player._id
      ? acc + point.weight
      : acc;
  }, 0);

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
    pointText: {
      textField: ['get', 'text'],
      textColor: 'white',
      textSize: [
        'interpolate',
        ['exponential', 2],
        ['zoom'],
        minZoomLevel,
        ['get', 'textSizeMin'],
        maxZoomLevel,
        ['get', 'textSizeMax'],
      ],
    },
  };

  const points = {
    type: 'FeatureCollection',
    features: [...props.room.map.homes, ...props.room.map.points].map(
      (point: any) => {
        const isHome = !point.weight;
        const isLocked =
          Boolean(point.collectedAt) &&
          differenceInMilliseconds(new Date(), new Date(point.collectedAt)) <
            gameConfig.durations.zoneLockedAfterCapture;

        const text = isHome ? '' : isLocked ? 'L' : point.weight;

        const textSizes = {
          min: 14,
          max: 110,
        };

        return {
          type: 'Feature',
          id: point.location.coordinates.join(','),
          properties: {
            color: isHome
              ? new TinyColor(Colors.blue30).setAlpha(0.4).toRgbString()
              : getPointColor(props.player, point),
            text,
            minSize: Math.max(
              getPointRadius(
                props.position.coords.latitude,
                minZoomLevel,
                isHome ? gameConfig.hitbox.home : gameConfig.hitbox.point,
              ),
              12,
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
        onPress={e => props.onPressMap(e.geometry.coordinates)}
        style={{flex: 1}}
        logoEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={isHardMode}>
        <MapBoxGL.Camera
          followUserLocation={!isHardMode}
          minZoomLevel={minZoomLevel}
          maxZoomLevel={maxZoomLevel}
          ref={cameraRef}
          zoomLevel={14}
          animationDuration={0}
        />
        <MapBoxGL.ShapeSource shape={points} id="points">
          <MapBoxGL.CircleLayer
            id="circleRadius"
            sourceLayerID="circleRadius"
            style={mapStyles.pointCircle as any}
          />
          <MapBoxGL.SymbolLayer
            id="pointText"
            sourceLayerID="pointText"
            style={mapStyles.pointText as any}
          />
        </MapBoxGL.ShapeSource>
        <MapBoxGL.UserLocation visible={!isHardMode} />
      </MapBoxGL.MapView>

      <TimeLeft finishedAt={new Date(props.room.finishedAt)} />
      <Score zoneScore={zoneScore} score={props.player.score} />
      {props.player.isWithinHome && <HomeIndicator />}
    </View>
  );
};

export default MapScreen;
