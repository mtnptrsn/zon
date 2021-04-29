import React, {FC, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import MapBoxGL from '@react-native-mapbox-gl/maps';
import {Coordinate, IPoint} from '../Room/types';
import {useRoute} from '@react-navigation/core';
import {Button, useTheme} from 'react-native-elements';
import Marker from '../../components/Marker';
import HomeMarker from '../../components/HomeMarker';
import useInterval from '@use-it/interval';
import {add} from 'date-fns';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import DropDownPicker from 'react-native-dropdown-picker';
import {getSpacing} from '../../theme/utils';
import TimeLeft from '../Room/components/TimeLeft';
import TinyColor from 'tinycolor2';

const getPointColor = (point: IPoint, time: Date) => {
  if (!point.collectedBy || new Date(point.collectedAt) > time)
    return 'rgba(244, 67, 54, 0.75)';
  return point.collectedBy.color;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  replayButton: {
    position: 'absolute',
    bottom: getSpacing(1),
    left: getSpacing(1),
    right: getSpacing(1),
  },
  dropdownContainer: {
    position: 'absolute',
    top: getSpacing(1),
    right: getSpacing(1),
    width: 70,
    borderRadius: 3,
    alignSelf: 'center',
  },
  dropdown: {
    height: 46,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.1)',
  },
});

const coordinateToString = ([lat, long]: Coordinate) => `${lat};${long}`;

const ReplayScreen: FC = props => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [speed, setSpeed] = useState(10);
  const route = useRoute();
  const room = (route.params! as any).room;
  const theme = useTheme();
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(14);
  const time = add(new Date(room.startedAt), {seconds: timeElapsed / 1000});
  const isFinished = time > new Date(room.finishedAt);

  const playersWithCoordinate = room.players.map((player: any) => {
    const playerPositions = room.playerPositions.filter(
      (pp: any) => pp.playerId === player._id,
    );
    const closestPlayerPosition = playerPositions.reduce(
      (acc: any, pp: any) => {
        const accTimeDiff = Math.abs(
          differenceInMilliseconds(time, new Date(acc.createdAt)),
        );
        const currentTimeDiff = Math.abs(
          differenceInMilliseconds(time, new Date(pp.createdAt)),
        );
        if (currentTimeDiff < accTimeDiff) return pp;
        return acc;
      },
    );
    return {
      player,
      coordinate: closestPlayerPosition.location.coordinates,
    };
  });

  useInterval(() => {
    setTimeElapsed(timeElapsed + (1000 / 3) * speed);
  }, 1000 / 3);

  const onPressReplay = () => {
    setTimeElapsed(0);
  };

  const onTouchEndMap = () => {
    (mapRef.current as any).getZoom().then(setZoom);
  };

  const onChangeSpeed = ({value}: {label: string; value: number}) => {
    setSpeed(value);
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
          defaultSettings={{
            centerCoordinate: room.map.start.location.coordinates,
            zoomLevel: 14,
          }}
          zoomLevel={14}
          animationDuration={0}
        />

        {playersWithCoordinate.map(({player, coordinate}: any) => {
          const score = room.map.points.reduce((acc: number, point: IPoint) => {
            if (
              point.collectedBy?._id === player._id &&
              time > new Date(point.collectedAt)
            )
              return acc + point.weight;
            return acc;
          }, 0);

          return (
            <MapBoxGL.MarkerView
              id={coordinateToString(coordinate)}
              key={coordinateToString(coordinate)}
              coordinate={coordinate}>
              <Marker weight={score} size={26} color={player.color}></Marker>
            </MapBoxGL.MarkerView>
          );
        })}

        {room.map.points.map((point: IPoint) => {
          const color = getPointColor(point, time);

          return (
            <MapBoxGL.MarkerView
              id={coordinateToString(point.location.coordinates)}
              key={coordinateToString(point.location.coordinates)}
              coordinate={point.location.coordinates}>
              <Marker size={20} weight={point.weight} color={color} />
            </MapBoxGL.MarkerView>
          );
        })}
        <MapBoxGL.MarkerView
          id={coordinateToString(room.map.start.location.coordinates)}
          key={coordinateToString(room.map.start.location.coordinates)}
          coordinate={room.map.start.location.coordinates}>
          <HomeMarker
            size={20}
            color={new TinyColor(theme.theme.colors!.primary!)
              .setAlpha(0.75)
              .toRgbString()}
          />
        </MapBoxGL.MarkerView>
      </MapBoxGL.MapView>

      <DropDownPicker
        containerStyle={styles.dropdownContainer}
        style={styles.dropdown}
        items={[1, 5, 10, 20, 50].map(x => ({label: `${x}x`, value: x}))}
        defaultValue={speed}
        onChangeItem={onChangeSpeed}
      />

      {isFinished && (
        <Button
          containerStyle={styles.replayButton}
          title="Watch Again"
          onPress={onPressReplay}
        />
      )}

      <TimeLeft now={time} finishedAt={new Date(room.finishedAt)} />
    </View>
  );
};

export default ReplayScreen;
