import React, {FC, useEffect, useState} from 'react';
// import {Text} from 'react-native-elements';
import {differenceInSeconds} from 'date-fns';
import {Vibration} from 'react-native';
import useInterval from '@use-it/interval';
import {GeolocationResponse} from '@react-native-community/geolocation';
import {vibrationDurations} from '../../../utils/vibration';
import {gameConfig} from '../../../config/game';
import {View, Text} from 'react-native-ui-lib';
import {speak} from 'expo-speech';

const useForceUpdate = () => {
  const [_, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
};

const CountdownScreen: FC = () => {
  const [timeLeft, setTime] = useState(gameConfig.durations.start / 1000);
  useEffect(() => Vibration.vibrate(vibrationDurations.short), []);

  const text = String(timeLeft || 'Starting');

  const forceUpdate = useForceUpdate();
  useInterval(() => {
    forceUpdate();
    setTime(Math.max(0, timeLeft - 1));
  }, 1000);

  useEffect(() => {
    speak(text);
  }, [text]);

  return (
    <View flex center>
      <Text primary textColor text20>
        {text}
      </Text>
    </View>
  );
};

export default CountdownScreen;
