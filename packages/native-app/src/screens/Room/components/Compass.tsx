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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: getSpacing(2),
    top: getSpacing(2),
    alignSelf: 'center',
    maxWidth: 60,
    maxHeight: 60,
    borderRadius: 99,
    borderWidth: 12,
    borderColor: 'rgba(255,255,255,.9)',
  },
});

const needleSize = 70;

const Compass: FC = () => {
  const offset = useSharedValue(0);

  const onChange = (heading: number) => {
    offset.value = heading;
  };

  useHeading(onChange);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{rotate: offset.value + 'deg'}],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        style={animatedStyles}
        width={needleSize}
        height={needleSize}
        source={Needle}
      />
      {/* <Text>{heading}</Text> */}
    </View>
  );
};

export default Compass;
