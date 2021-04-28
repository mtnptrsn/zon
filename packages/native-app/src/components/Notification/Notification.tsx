import React, {FC, useEffect, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';
import {getSpacing} from '../../theme/utils';

import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface INotificationProps {
  top: number;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: getSpacing(1),
    right: getSpacing(1),
  },
});

const Notification: FC<INotificationProps> = props => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(false);
    }, 4000);
  }, []);

  if (!isVisible) return null;

  return (
    <View style={[styles.container, {top: props.top || getSpacing(2)}]}>
      {props.children}
    </View>
  );
};

export default Notification;
