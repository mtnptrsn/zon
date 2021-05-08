import React, {FC, useRef, useState} from 'react';
import {StyleSheet} from 'react-native';
import MapBoxGL from '@react-native-mapbox-gl/maps';
import {IPoint} from '../../types';
import {View, Button, Colors} from 'react-native-ui-lib';
import TimeLeft from '../../components/TimeLeft';
import Score from '../../components/Score';
import HomeIndicator from '../../components/HomeIndicator';
import {GeolocationResponse} from '@react-native-community/geolocation';
import TinyColor from 'tinycolor2';
import {getSpacing} from '../../../../theme/utils';
import Feather from 'react-native-vector-icons/Feather';
import {getPointRadius} from '../../../../utils/map';
import {gameConfig} from '../../../../config/game';
import {differenceInMilliseconds} from 'date-fns';
import useInterval from '@use-it/interval';

const minZoomLevel = 13;
const maxZoomLevel = 19;

interface IMapScreenProps {
  room: any;
  position: GeolocationResponse;
  player: any;
}

const useForceUpdate = () => {
  const [_, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerButtonContainer: {
    position: 'absolute',
    bottom: getSpacing(1),
    right: getSpacing(1),
    paddingTop: getSpacing(1),
    paddingBottom: getSpacing(1),
  },
  markerText: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 3,
  },
});

const getPointColor = (player: any, point: IPoint, flags: string[]) => {
  const isControl = flags.includes('CONTROL');

  const disabledColor = new TinyColor(Colors.grey30)
    .setAlpha(0.3)
    .toRgbString();
  if (point.collectedBy?.color)
    return new TinyColor(point.collectedBy.color).setAlpha(0.8).toRgbString();
  if (!player.hasTakenFirstPoint && point.belongsTo?._id !== player._id)
    return disabledColor;
  if (isControl) {
    if (
      Boolean(point.belongsTo) &&
      point.belongsTo?._id !== player._id &&
      !Boolean(point.collectedBy)
    )
      return disabledColor;
  }
  if (!isControl) {
    if (Boolean(point.belongsTo) && point.belongsTo?._id !== player._id)
      return disabledColor;
  }
  return new TinyColor(Colors.green30).setAlpha(0.8).toRgbString();
};

const MapScreen: FC<IMapScreenProps> = props => {
  const cameraRef = useRef(null);
  const isControl = props.room.flags.includes('CONTROL');
  const update = useForceUpdate();

  // TODO: Remove this after db refactor
  useInterval(() => {
    update();
  }, 3000);

  const scoreGrowth = props.room.map.points.reduce(
    (acc: number, point: any) => {
      return point.collectedBy?._id === props.player._id
        ? acc + point.weight
        : acc;
    },
    0,
  );

  const onPressCenter = () => {
    (cameraRef.current as any).setCamera({
      centerCoordinate: [
        props.position.coords.longitude,
        props.position.coords.latitude,
      ],
      zoomLevel: 14,
    });
  };

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
    features: [props.room.map.start, ...props.room.map.points].map(
      (point: any) => {
        const isHome = !point.weight;
        const isLocked =
          Boolean(point.collectedAt) &&
          differenceInMilliseconds(new Date(), new Date(point.collectedAt)) <
            1000 * 60 * 3;

        const text = isHome ? '' : isLocked ? 'LOCK' : point.weight;

        const textSizes = {
          large: {
            min: 14,
            max: 110,
          },
          small: {
            min: 8,
            max: 110,
          },
        };

        return {
          type: 'Feature',
          id: point.location.coordinates.join(','),
          properties: {
            color: isHome
              ? new TinyColor(Colors.blue30).setAlpha(0.4).toRgbString()
              : getPointColor(props.player, point, props.room.flags),
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
            textSizeMin: isLocked ? textSizes.small.min : textSizes.large.min,
            textSizeMax: isLocked ? textSizes.small.max : textSizes.large.max,
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
        logoEnabled={false}
        style={{flex: 1}}
        pitchEnabled={false}
        rotateEnabled={false}>
        <MapBoxGL.Camera
          minZoomLevel={minZoomLevel}
          maxZoomLevel={maxZoomLevel}
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: props.room.map.start.location.coordinates,
            zoomLevel: 14,
          }}
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
        <MapBoxGL.UserLocation />
      </MapBoxGL.MapView>

      <Button
        size={Button.sizes.xSmall}
        style={styles.centerButtonContainer}
        onPress={onPressCenter}
        backgroundColor="white">
        <Feather color="black" size={24} name="map-pin" />
      </Button>

      <TimeLeft finishedAt={new Date(props.room.finishedAt)} />
      <Score
        scoreGrowth={isControl ? scoreGrowth : null}
        score={props.player.score}
      />
      {props.player.isWithinHome && <HomeIndicator />}
    </View>
  );
};

export default MapScreen;
