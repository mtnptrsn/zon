import React, {FC, useEffect, useState} from 'react';
import {Text} from 'react-native-elements';
import {differenceInSeconds} from 'date-fns';
import {StyleSheet, Vibration, View} from 'react-native';
import useInterval from '@use-it/interval';
import {GeolocationResponse} from '@react-native-community/geolocation';
import {vibrationDurations} from '../../../utils/vibration';
import {gameConfig} from '../../../config/game';

interface ICountdownScreenProps {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    color: '#2196F3',
  },
});

const useForceUpdate = () => {
  const [_, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
};

const CountdownScreen: FC<ICountdownScreenProps> = () => {
  const [timeLeft, setTime] = useState(gameConfig.durations.start);
  useEffect(() => Vibration.vibrate(vibrationDurations.short), []);

  const forceUpdate = useForceUpdate();
  useInterval(() => {
    forceUpdate();
    setTime(Math.max(0, timeLeft - 1));
  }, 1000);

  return (
    <View style={styles.container}>
      <Text h1 style={styles.countdownText}>
        {timeLeft || 'Starting'}
      </Text>
    </View>
  );
};

export default CountdownScreen;
