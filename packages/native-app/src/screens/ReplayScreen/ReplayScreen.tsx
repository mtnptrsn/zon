import React, {FC, useEffect, useRef, useState} from 'react';
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
import Feather from 'react-native-vector-icons/Feather';
import {TouchableOpacity} from 'react-native-gesture-handler';
// @ts-ignore
import Slider from 'react-native-slider';
import {getMarkerSize} from '../../utils/map';
import {gameConfig} from '../../config/game';
import {Colors, Text} from 'react-native-ui-lib';

const getPointColor = (point: IPoint, time: Date) => {
  const hasBeenCollected =
    Boolean(point.collectedAt) && new Date(point.collectedAt) < time;
  if (hasBeenCollected) return point.collectedBy.color;
  return new TinyColor(Colors.green30).setAlpha(0.8).toRgbString();
};

const getPointText = (point: IPoint, time: Date) => {
  const hasBeenCollected =
    Boolean(point.collectedAt) && new Date(point.collectedAt) < time;
  if (hasBeenCollected)
    return point.collectedBy.name.substring(0, 1).toUpperCase();
  return point.weight;
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
    bottom: getSpacing(1.2),
    right: getSpacing(1),
    width: 70,
    borderRadius: 3,
    alignSelf: 'center',
  },
  dropdown: {
    height: 38,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.1)',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: getSpacing(1),
    left: getSpacing(1),
    right: getSpacing(1),
    borderRadius: 3,
    backgroundColor: 'white',
    padding: getSpacing(1),
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: {marginRight: 3},
  slider: {flex: 1},
  markerText: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 3,
  },
});

const coordinateToString = ([lat, long]: Coordinate) => `${lat};${long}`;

const ReplayScreen: FC = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const route = useRoute();
  const room = (route.params! as any).room;
  const theme = useTheme();
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(14);
  const time = add(new Date(room.startedAt), {seconds: timeElapsed / 1000});
  const [isPaused, setIsPaused] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const duration = differenceInMilliseconds(
    new Date(room.finishedAt),
    new Date(room.startedAt),
  );
  const progress = timeElapsed / duration;
  const homeMarkerSize = getMarkerSize(
    room.map.start.location.coordinates[1],
    zoom,
    gameConfig.hitbox.home,
    20,
  );

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

  useEffect(() => {
    if (progress >= 1) {
      setTimeElapsed(0);
      setIsPaused(true);
    }
  }, [progress]);

  useInterval(() => {
    if (isPaused || isSliding) return;
    setTimeElapsed(timeElapsed + (1000 / 6) * 25);
  }, 1000 / 6);

  const onTouchEndMap = () => {
    (mapRef.current as any).getZoom().then(setZoom);
  };

  const toggleIsPaused = () => {
    setIsPaused(!isPaused);
  };

  const onSliderValueChange = (value: number) =>
    setTimeElapsed(value * duration);

  const onSlidingStart = () => setIsSliding(true);
  const onSlidingComplete = () => setIsSliding(false);

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

        {room.map.points.map((point: IPoint) => {
          const color = getPointColor(point, time);
          const text = getPointText(point, time);
          const markerSize = getMarkerSize(
            point.location.coordinates[1],
            zoom,
            gameConfig.hitbox.point,
            22,
          );
          const fontSize = Math.min(40, markerSize / 1.75);

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
                color={color}>
                <Text
                  style={[
                    {
                      fontSize: fontSize,
                    },
                    styles.markerText,
                  ]}
                  center
                  white>
                  {text}
                </Text>
              </Marker>
            </MapBoxGL.MarkerView>
          );
        })}
        <MapBoxGL.MarkerView
          id={coordinateToString(room.map.start.location.coordinates)}
          key={coordinateToString(room.map.start.location.coordinates)}
          coordinate={room.map.start.location.coordinates}>
          <Marker
            size={homeMarkerSize}
            color={new TinyColor(Colors.blue30).setAlpha(0.25).toRgbString()}
          />
        </MapBoxGL.MarkerView>

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
              <Marker size={28} color={player.color}>
                <Text style={styles.markerText} text70 center white>
                  {score}
                </Text>
              </Marker>
            </MapBoxGL.MarkerView>
          );
        })}
      </MapBoxGL.MapView>

      <View style={styles.controlsContainer}>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            containerStyle={styles.play}
            onPress={toggleIsPaused}>
            <Feather
              color="rgba(0,0,0,.7)"
              size={38}
              name={isPaused ? 'play' : 'pause'}
            />
          </TouchableOpacity>
          <Slider
            style={styles.slider}
            onSlidingStart={onSlidingStart}
            onSlidingComplete={onSlidingComplete}
            onValueChange={onSliderValueChange}
            minimumTrackTintColor="rgba(0,0,0,0.45)"
            maximumTrackTintColor="rgba(0,0,0,0.30)"
            thumbTintColor={theme.theme.colors!.primary}
            value={Math.min(1, progress)}
          />
        </View>
      </View>
      <TimeLeft now={time} finishedAt={new Date(room.finishedAt)} />
    </View>
  );
};

export default ReplayScreen;
