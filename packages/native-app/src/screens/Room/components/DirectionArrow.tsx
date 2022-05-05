import React, {FC, useEffect} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import {Text, View} from 'react-native-ui-lib';
import CompassHeading from 'react-native-compass-heading';
import {Image} from 'react-native';
import {getRhumbLineBearing} from 'geolib';

const Arrow = require('../../../../assets/images/next.png');

interface IDirectionArrowProps {
  currentPosition: [number, number];
  targetPosition: [number, number];
}

const imageRatio = 1.93207547;
const width = 60;

const DirectionArrow: FC<IDirectionArrowProps> = props => {
  const heading = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${heading.value}deg`}],
    };
  });

  useEffect(() => {
    const degree_update_rate = 3;

    CompassHeading.start(degree_update_rate, ({heading: currentHeading}) => {
      const targetHeading = getRhumbLineBearing(
        props.currentPosition,
        props.targetPosition,
      );
      const headingDifference = targetHeading - currentHeading;

      // console.log({targetHeading, headingDifference, currentHeading});

      console.log({currentHeading, targetHeading});

      heading.value = headingDifference;
    });
  }, []);

  return (
    <View>
      <Animated.Image
        style={animatedStyles}
        width={width}
        height={width * imageRatio}
        source={Arrow}
      />
    </View>
  );
};

export default DirectionArrow;
