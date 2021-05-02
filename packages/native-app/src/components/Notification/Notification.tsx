import React, {FC, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
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
  const offset = useSharedValue(-10);
  const opacity = useSharedValue(0);
  useEffect(() => {
    offset.value = withSpring(0);
    opacity.value = withSpring(1);
    setTimeout(() => {
      offset.value = withSpring(-10);
      opacity.value = withSpring(0);
      setTimeout(() => setIsVisible(false), 1000);
    }, 6000);
  }, []);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{translateY: offset.value}],
      opacity: opacity.value,
    };
  });
  if (!isVisible) return null;
  return (
    <Animated.View
      style={[
        styles.container,
        {top: props.top || getSpacing(2)},
        animatedStyles,
      ]}>
      {props.children}
    </Animated.View>
  );
};

export default Notification;
