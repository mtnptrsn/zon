import React, {FC} from 'react';
import {StyleSheet} from 'react-native';
import {getSpacing} from '../../../theme/utils';
import Feather from 'react-native-vector-icons/Feather';
import {View} from 'react-native-ui-lib';

interface IHomeIndicatorProps {}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: getSpacing(1),
    right: getSpacing(1),
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.1)',
  },
});

const HomeIndicator: FC<IHomeIndicatorProps> = props => {
  return (
    <View
      backgroundColor="white"
      height={46}
      paddingH-12
      center
      br10
      style={styles.container}>
      <Feather size={24} name="home" />
    </View>
  );
};

export default HomeIndicator;
