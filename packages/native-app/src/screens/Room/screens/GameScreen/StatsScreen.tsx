import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import {getDistance} from 'geolib';
import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {getUniqueId} from 'react-native-device-info';
import {Text} from 'react-native-elements';
import {Button} from 'react-native-elements';
import {getSpacing} from '../../../../theme/utils';
import {IPoint} from '../../types';

interface IStatsScreenProps {
  room: any;
  player: any;
  onPressLeave: () => void;
  onPressEndGame: () => void;
  onPressReplay: () => void;
}

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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    flex: 1,
    padding: getSpacing(1),
    backgroundColor: 'white',
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
  closeButton: {
    marginTop: 'auto',
  },
  playersTitle: {
    marginTop: getSpacing(1),
  },
  buttons: {
    position: 'absolute',
    bottom: getSpacing(4) + 7,
    left: getSpacing(1),
    right: getSpacing(1),
    flexDirection: 'column',
  },
  endGameButton: {
    flex: 1,
    marginTop: getSpacing(0.5),
  },
  replayButton: {
    flex: 1,
    marginTop: getSpacing(0.5),
  },
  leaveButton: {
    flex: 1,
    marginTop: getSpacing(0.5),
  },
  statsContainer: {
    marginLeft: getSpacing(2.3),
    marginTop: getSpacing(0.25),
  },
  statsText: {
    color: 'rgba(0,0,0,.7)',
  },
});

const StatsScreen: FC<IStatsScreenProps> = props => {
  const duration = differenceInMilliseconds(
    new Date(props.room.finishedAt),
    new Date(props.room.startedAt),
  );

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
        const playerPositions = (props.room.playerPositions || []).filter(
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
                {!player.isWithinHome ? '(disqualified)' : ''}
              </Text>
            </View>
            {props.room.status === 'FINISHED' && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                  Distance: {distance / 1000} km
                </Text>
                <Text style={styles.statsText}>Pace: {pace} min/km</Text>
              </View>
            )}
          </View>
        );
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.playersTitle} h4>
        Leaderboard
      </Text>

      {renderPlayers()}

      <View style={styles.buttons}>
        {props.room.status === 'FINISHED' && (
          <Button
            onPress={props.onPressReplay}
            containerStyle={styles.replayButton}
            type="outline"
            title="Show Replay"
          />
        )}
        {props.player.isHost && props.room.status === 'PLAYING' && (
          <Button
            onPress={props.onPressEndGame}
            containerStyle={styles.endGameButton}
            type="outline"
            title="End Game"
          />
        )}
        <Button
          onPress={props.onPressLeave}
          containerStyle={styles.leaveButton}
          type="outline"
          title="Leave"
        />
      </View>
    </View>
  );
};

export default StatsScreen;
