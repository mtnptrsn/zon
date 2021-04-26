import React, {FC} from 'react';
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
    opacity: 0.5,
    borderRadius: 3,
    width: 30,
    height: 30,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'white',
  },
  playerColorBar: {
    height: 6,
  },
});

const coordinateToString = ([lat, long]: Coordinate) => `${lat};${long}`;

const MapScreen: FC<IMapScreenProps> = props => {
  const theme = useTheme();

  const score = props.room.map.points.reduce((acc: number, point: any) => {
    if (point.collectedBy?._id === props.player._id) return acc + 1;
    return acc;
  }, 0);

  return (
    <View style={styles.container}>
      <View
        style={[styles.playerColorBar, {backgroundColor: props.player.color}]}
      />
      <MapBoxGL.MapView
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
              <Marker color={point.collectedBy?.color || '#f44336'} />
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
              {backgroundColor: theme.theme.colors!.primary},
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
