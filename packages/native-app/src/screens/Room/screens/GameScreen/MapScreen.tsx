import React, {FC, useRef, useState} from 'react';
import {StyleSheet} from 'react-native';
import MapBoxGL from '@react-native-mapbox-gl/maps';
import {Coordinate, IPoint} from '../../types';
import {useTheme} from 'react-native-elements';
import {View, Button} from 'react-native-ui-lib';
import TimeLeft from '../../components/TimeLeft';
import Score from '../../components/Score';
import HomeIndicator from '../../components/HomeIndicator';
import Marker from '../../../../components/Marker';
import {GeolocationResponse} from '@react-native-community/geolocation';
import HomeMarker from '../../../../components/HomeMarker';
import {getMarkerSize} from '../../../../utils/map';
import TinyColor from 'tinycolor2';
import {getSpacing} from '../../../../theme/utils';
import Feather from 'react-native-vector-icons/Feather';
import {gameConfig} from '../../../../config/game';

interface IMapScreenProps {
  room: any;
  position: GeolocationResponse;
  player: any;
}

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
});

const coordinateToString = ([lat, long]: Coordinate) => `${lat};${long}`;

const getPointColor = (player: any, point: IPoint) => {
  if (point.collectedBy?.color)
    return new TinyColor(point.collectedBy.color).setAlpha(0.75).toRgbString();
  if (!player.hasTakenFirstPoint && point.belongsTo?._id !== player._id)
    return 'rgba(0,0,0,.2)';
  return 'rgba(244, 67, 54, .75)';
};

const MapScreen: FC<IMapScreenProps> = props => {
  const theme = useTheme();
  const mapRef = useRef(null);
  const cameraRef = useRef(null);
  const [zoom, setZoom] = useState(14);
  const homeMarkerSize = getMarkerSize(
    props.room.map.start.location.coordinates[1],
    zoom,
    gameConfig.hitbox.home,
    20,
  );

  const score = props.room.map.points.reduce((acc: number, point: IPoint) => {
    if (point.collectedBy?._id === props.player._id) return acc + point.weight;
    return acc;
  }, 0);

  const onTouchEndMap = () => {
    (mapRef.current as any).getZoom().then(setZoom);
  };

  const onPressCenter = () => {
    (cameraRef.current as any).setCamera({
      centerCoordinate: [
        props.position.coords.longitude,
        props.position.coords.latitude,
      ],
      zoomLevel: 14,
    });
  };

  return (
    <View style={styles.container}>
      <MapBoxGL.MapView
        onTouchEnd={onTouchEndMap}
        ref={mapRef}
        logoEnabled={false}
        style={{flex: 1}}
        pitchEnabled={false}
        rotateEnabled={false}>
        <MapBoxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: props.room.map.start.location.coordinates,
            zoomLevel: 14,
          }}
          zoomLevel={14}
          animationDuration={0}
        />

        {props.room.map.points.map((point: IPoint) => {
          return (
            <MapBoxGL.MarkerView
              id={coordinateToString(point.location.coordinates)}
              key={coordinateToString(point.location.coordinates)}
              coordinate={point.location.coordinates}>
              <Marker
                size={getMarkerSize(
                  point.location.coordinates[1],
                  zoom,
                  gameConfig.hitbox.point,
                  20,
                )}
                weight={point.weight}
                color={getPointColor(props.player, point)}
              />
            </MapBoxGL.MarkerView>
          );
        })}
        <MapBoxGL.MarkerView
          id={coordinateToString(props.room.map.start.location.coordinates)}
          key={coordinateToString(props.room.map.start.location.coordinates)}
          coordinate={props.room.map.start.location.coordinates}>
          <Marker
            size={homeMarkerSize}
            color={new TinyColor(theme.theme.colors!.primary!)
              .setAlpha(0.75)
              .toRgbString()}
          />
        </MapBoxGL.MarkerView>
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
      <Score score={score} />
      {props.player.isWithinHome && <HomeIndicator />}
    </View>
  );
};

export default MapScreen;
