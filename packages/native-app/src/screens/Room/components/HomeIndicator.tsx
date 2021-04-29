import useInterval from '@use-it/interval';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import React, {FC, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-elements';
import {getSpacing} from '../../../theme/utils';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface IHomeIndicatorProps {}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: getSpacing(1),
    right: getSpacing(1),
    backgroundColor: 'white',
    paddingHorizontal: getSpacing(1),
    paddingVertical: getSpacing(0.75),
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.8)',
  },
});

const HomeIndicator: FC<IHomeIndicatorProps> = props => {
  return (
    <View style={styles.container}>
      <FontAwesome size={24} name="home" />
    </View>
  );
};

export default HomeIndicator;
