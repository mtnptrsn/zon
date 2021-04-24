import React, {FC, useContext, useEffect} from 'react';
import {StyleSheet, Vibration, View} from 'react-native';
import MapBoxGL from '@react-native-mapbox-gl/maps';
import {Coordinate, IPoint} from '../types';
import {getBounds} from '../utils';
import {usePosition} from '../../../hooks/usePosition';
import {SocketContext} from '../../../socket/context';
import {getUniqueId} from 'react-native-device-info';
import subscribeToEvents from '../../../socket/subscribeToEvents';
import Toast from 'react-native-toast-message';
import {vibrationDurations} from '../../../utils/vibration';
import TimeColorIndicator from '../components/TimeColorIndicator';
import {useTheme} from 'react-native-elements';

const coordinateToString = ([lat, long]: Coordinate) => `${lat};${long}`;
const translateEventMessage = (
  translateMap: {[key: string]: string},
  message: string,
) => {
  return Object.entries(translateMap).reduce((acc, [key, value]) => {
    const keyFound = acc.includes(`{${key}}`);
    if (keyFound) return acc.replace(`{${key}}`, value);
    return acc;
  }, message);
};

// TODO: Store this access token in env file
MapBoxGL.setAccessToken(
  'pk.eyJ1IjoibXRucHRyc24iLCJhIjoiY2tuN3JkdmNuMGFyYjJ1bXFsZHFvZnZyaiJ9._8xfeiMfcT5cTsfo-QY94w',
);

interface IGameScreenProps {
  room: any;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  marker: {
    borderRadius: 99,
    width: 20,
    height: 20,
    borderWidth: 3,
    borderStyle: 'solid',
    borderColor: 'white',
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
});

const GameScreen: FC<IGameScreenProps> = props => {
  const theme = useTheme();
  const socket = useContext(SocketContext);
  const position = usePosition({distanceFilter: 5});
  const player = props.room.players.find(
    (player: any) => player._id === getUniqueId(),
  );
  subscribeToEvents(props.room._id, event => {
    const eventBelongsToCurrentPlayer = event.player?._id === getUniqueId();
    const vibrateDuration = eventBelongsToCurrentPlayer
      ? vibrationDurations.long
      : vibrationDurations.short;
    Vibration.vibrate(vibrateDuration);
    Toast.show({
      text2: translateEventMessage(
        {
          player: eventBelongsToCurrentPlayer
            ? 'You'
            : event.player?.name || '',
        },
        event.message,
      ),
      type: eventBelongsToCurrentPlayer ? 'success' : 'info',
    });
  });

  useEffect(() => Vibration.vibrate(vibrationDurations.long), []);

  useEffect(() => {
    const {longitude, latitude} = position.coords;
    if (longitude === 0 && latitude === 0) return;
    socket!.emit(
      'update:position',
      {
        roomId: props.room._id,
        playerId: getUniqueId(),
        coordinate: [longitude, latitude],
      },
      () => {},
    );
  }, [position]);

  return (
    <View style={styles.container}>
      <MapBoxGL.MapView
        style={{flex: 1}}
        pitchEnabled={false}
        rotateEnabled={false}>
        <MapBoxGL.Camera
          bounds={getBounds(
            props.room.map.points.map(
              (point: IPoint) => point.location.coordinates,
            ),
            50,
          )}
          animationDuration={0}
        />

        {props.room.map.points.map((point: IPoint) => {
          return (
            <MapBoxGL.MarkerView
              id={coordinateToString(point.location.coordinates)}
              key={coordinateToString(point.location.coordinates)}
              coordinate={point.location.coordinates}>
              <View
                style={[
                  styles.marker,
                  {
                    backgroundColor: point.collectedBy?.color || '#f44336',
                  },
                ]}
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
              {backgroundColor: theme.theme.colors!.primary},
            ]}
          />
        </MapBoxGL.MarkerView>
        <MapBoxGL.UserLocation />
      </MapBoxGL.MapView>

      <TimeColorIndicator player={player} room={props.room} />
    </View>
  );
};

export default GameScreen;
