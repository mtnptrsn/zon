import {GeolocationResponse} from '@react-native-community/geolocation';
import {StackActions, useNavigation} from '@react-navigation/core';
import React, {FC, useEffect} from 'react';
import {StyleSheet, Vibration, View} from 'react-native';
import {getUniqueId} from 'react-native-device-info';
import {Text} from 'react-native-elements';
import {Button} from 'react-native-elements';
import {getSpacing} from '../../../../theme/utils';
import {IPoint} from '../../types';

interface ILobbyScreenProps {
  room: any;
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getSpacing(1),
  },
  closeButton: {
    marginTop: 'auto',
  },
  playersTitle: {
    marginTop: getSpacing(1),
  },
});

const StatsScreen: FC<ILobbyScreenProps> = props => {
  const renderPlayers = () => {
    return props.room.players
      .map((player: any) => {
        const score = props.room.map.points.reduce(
          (acc: number, point: IPoint) => {
            if (point.collectedBy?._id === player._id) return acc + 1;
            return acc;
          },
          0,
        );

        return {score, player};
      })
      .sort((a: any, b: any) => b.score - a.score)
      .map(({score, player}: {score: number; player: any}) => {
        const isCurrentPlayer = player._id === getUniqueId();

        return (
          <View key={player._id} style={styles.playerContainer}>
            <View
              style={[
                styles.playerColor,
                {
                  backgroundColor: player.color,
                },
              ]}
            />
            <Text style={styles.playerText}>
              {isCurrentPlayer ? 'You' : player.name} - {score} point(s)
            </Text>
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
    </View>
  );
};

export default StatsScreen;
