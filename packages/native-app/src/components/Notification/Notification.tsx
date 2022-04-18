import React, {FC, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {getSpacing} from '../../theme/utils';

import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {View} from 'react-native-ui-lib';

interface INotificationProps {
  top: number;
  isVisible: boolean;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: getSpacing(1),
    right: getSpacing(1),
  },
});

const Notification: FC<INotificationProps> = props => {
  if (!props.isVisible) return null;

  return (
    <View style={[styles.container, {top: props.top || getSpacing(2)}]}>
      {props.children}
    </View>
  );
};

export default Notification;
