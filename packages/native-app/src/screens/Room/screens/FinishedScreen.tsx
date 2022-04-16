import {GeolocationResponse} from '@react-native-community/geolocation';
import {StackActions, useNavigation} from '@react-navigation/core';
import {getDistance} from 'geolib';
import React, {FC, useEffect} from 'react';
import {StyleSheet, Vibration, View} from 'react-native';
import {getUniqueId} from 'react-native-device-info';
import {Text} from 'react-native-elements';
import {Button} from 'react-native-elements';
import {getSpacing} from '../../../theme/utils';
import {vibrationDurations} from '../../../utils/vibration';
import {IPoint} from '../types';
import {differenceInMilliseconds} from 'date-fns';

const getDistanceTravelled = (coordinates: [number, number][]) => {
  return coordinates.slice(1).reduce(
    (
      acc: {sum: number; previous: [number, number]},
      coordinate: [number, number],
    ) => {
      return {
        sum:
          acc.sum +
          getDistance(
            {longitude: coordinate[0], latitude: coordinate[1]},
            {longitude: acc.previous[0], latitude: acc.previous[1]},
          ),
        previous: coordinate,
      };
    },
    {sum: 0, previous: coordinates[0]},
  ).sum;
};

const addTrailingZero = (string: string) =>
  string.length === 1 ? `${string}0` : string;

const getPace = (duration: number, distance: number) => {
  if (!distance || !duration) return `0:00`;
  const minutes = duration / 60 / 1000 / (distance / 1000);
  return `${Math.floor(minutes)}:${addTrailingZero(
    String(Math.round((minutes % 1) * 60)),
  )}`;
};
interface ILobbyScreenProps {
  room: any;
  position: GeolocationResponse;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: getSpacing(1),
  },
  playerText: {
    fontSize: 16,
  },
  playerColor: {
    width: 20,
    height: 20,
    borderRadius: 99,
    marginRight: getSpacing(0.5),
  },
  playerContainer: {
    marginTop: getSpacing(1),
  },
  statsContainer: {
    marginLeft: getSpacing(2.3),
    marginTop: getSpacing(0.5),
  },
  statsText: {
    color: 'rgba(0,0,0,.7)',
  },
  closeButton: {
    marginTop: 'auto',
  },
  playersTitle: {
    marginTop: getSpacing(1),
  },
});

const FinishedScreen: FC<ILobbyScreenProps> = props => {
  const navigation = useNavigation();
  const duration = differenceInMilliseconds(
    new Date(props.room.finishedAt),
    new Date(props.room.startedAt),
  );

  useEffect(() => {
    Vibration.vibrate(vibrationDurations.long);
  }, []);

  const onPressClose = () => {
    navigation.dispatch(StackActions.popToTop());
  };

  const renderPlayers = () => {
    return props.room.players
      .map((player: any) => {
        const score = props.room.map.points.reduce(
          (acc: number, point: IPoint) => {
            if (point.collectedBy?._id === player._id)
              return acc + point.weight;
            return acc;
          },
          0,
        );

        return {score, player};
      })
      .sort((a: any, b: any) => b.score - a.score)
      .map(({score, player}: {score: number; player: any}) => {
        const playerPositions = props.room.playerPositions.filter(
          (pp: any) => pp.playerId === player._id,
        );
        const isCurrentPlayer = player._id === getUniqueId();
        const distance = getDistanceTravelled(
          playerPositions.map((pp: any) => pp.location.coordinates),
        );
        const pace = getPace(duration, distance);

        return (
          <View key={player._id} style={styles.playerContainer}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={[
                  styles.playerColor,
                  {
                    backgroundColor: player.color,
                  },
                ]}
              />
              <Text style={styles.playerText}>
                {isCurrentPlayer ? 'You' : player.name} - {score} point(s){' '}
              </Text>
            </View>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                Distance: {distance / 1000} km
              </Text>
              <Text style={styles.statsText}>Pace: {pace} min/km</Text>
            </View>
          </View>
        );
      });
  };

  return (
    <View style={styles.container}>
      <Text h3>The game is over</Text>
      <Text style={styles.playersTitle} h4>
        Leaderboard
      </Text>
      {renderPlayers()}
      <Button
        onPress={onPressClose}
        containerStyle={styles.closeButton}
        title="Close"
      />
    </View>
  );
};

export default FinishedScreen;
