import React, {FC, useState} from 'react';
import {Text} from 'react-native-elements';
import {differenceInSeconds} from 'date-fns';
import {StyleSheet, View} from 'react-native';
import useInterval from '@use-it/interval';
import {GeolocationResponse} from '@react-native-community/geolocation';

interface ICountdownScreenProps {
  room: any;
  position: GeolocationResponse;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    // TODO: Set a theme like react-native-elements
    color: '#2196F3',
  },
});

const getTimeLeft = (startedAt: Date) => {
  return Math.max(differenceInSeconds(startedAt, new Date()), 0);
};

const useForceUpdate = () => {
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
};

const CountdownScreen: FC<ICountdownScreenProps> = props => {
  const forceUpdate = useForceUpdate();
  useInterval(() => {
    forceUpdate();
  }, 500);

  return (
    <View style={styles.container}>
      <Text h1 style={styles.countdownText}>
        {getTimeLeft(new Date(props.room.startedAt)) + 1}
      </Text>
    </View>
  );
};

export default CountdownScreen;
