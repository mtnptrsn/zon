import React, {FC} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {View, Text, Image} from 'react-native-ui-lib';
import {useHeading} from '../../../hooks/useHeading';
import {getSpacing} from '../../../theme/utils';

const Needle = require('../../../../assets/images/needle.png');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: getSpacing(1),
    top: getSpacing(1),
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.1)',
    alignSelf: 'center',
  },
});

const needleSize = 50;

const Compass: FC = () => {
  const heading = useHeading();

  const offset = useSharedValue(heading);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{rotate: offset.value + 'deg'}],
    };
  });

  return (
    <View
      backgroundColor="white"
      height={46}
      paddingH-16
      center
      br10
      style={styles.container}>
      <Animated.Image
        style={{transform: [{rotate: `${heading}deg`}]}}
        width={needleSize}
        height={needleSize}
        source={Needle}
      />
      {/* <Text>{heading}</Text> */}
    </View>
  );
};

export default Compass;
