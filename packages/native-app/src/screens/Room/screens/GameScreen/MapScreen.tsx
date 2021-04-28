import React, {FC, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import MapBoxGL from '@react-native-mapbox-gl/maps';
import {Coordinate, IPoint} from '../../types';
import {useTheme} from 'react-native-elements';
import TimeLeft from '../../components/TimeLeft';
import Score from '../../components/Score';
import HomeIndicator from '../../components/HomeIndicator';
import Marker from '../../../../components/Marker';
import {GeolocationResponse} from '@react-native-community/geolocation';

interface IMapScreenProps {
  room: any;
  position: GeolocationResponse;
  player: any;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  homeMarker: {
    opacity: 0.75,
    borderRadius: 3,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'white',
  },
  playerColorBar: {
    height: 6,
  },
});

const getMarkerSize = (
  latitude: number,
  zoom: number,
  hitbox: number,
  minSize: number,
) => {
  const mpp =
    (78271.5169648 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
  const ppm = Math.pow(mpp, -1);
  const size = Math.max(minSize, ppm * hitbox * 2);
  return size;
};

const coordinateToString = ([lat, long]: Coordinate) => `${lat};${long}`;

const MapScreen: FC<IMapScreenProps> = props => {
  const theme = useTheme();
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(14);
  const homeMarkerSize = getMarkerSize(
    props.room.map.start.location.coordinates[1],
    zoom,
    60,
    20,
  );

  const score = props.room.map.points.reduce((acc: number, point: IPoint) => {
    if (point.collectedBy?._id === props.player._id) return acc + point.weight;
    return acc;
  }, 0);

  const onTouchEndMap = () => {
    (mapRef.current as any).getZoom().then(setZoom);
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.playerColorBar, {backgroundColor: props.player.color}]}
      />
      <MapBoxGL.MapView
        onTouchEnd={onTouchEndMap}
        ref={mapRef}
        logoEnabled={false}
        style={{flex: 1}}
        pitchEnabled={false}
        rotateEnabled={false}>
        <MapBoxGL.Camera
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
                  60,
                  20,
                )}
                weight={point.weight}
                color={point.collectedBy?.color || 'rgba(244, 67, 54, .75)'}
              />
            </MapBoxGL.MarkerView>
          );
        })}
        <MapBoxGL.MarkerView
          id={coordinateToString(props.room.map.start.location.coordinates)}
          key={coordinateToString(props.room.map.start.location.coordinates)}
          coordinate={props.room.map.start.location.coordinates}>
          <View
            style={[
              styles.homeMarker,
              {
                width: homeMarkerSize,
                height: homeMarkerSize,
                backgroundColor: theme.theme.colors!.primary,
              },
            ]}
          />
        </MapBoxGL.MarkerView>
        <MapBoxGL.UserLocation />
      </MapBoxGL.MapView>

      <TimeLeft finishedAt={new Date(props.room.finishedAt)} />
      <Score score={score} />
      {props.player.isWithinHome && <HomeIndicator />}
    </View>
  );
};

export default MapScreen;
