import MapboxGL from '@rnmapbox/maps';
import {useRoute} from '@react-navigation/core';
import React, {FC, useState} from 'react';
import {Dimensions, ScrollView} from 'react-native';
import {View, Text, Button, Image} from 'react-native-ui-lib';
import {getSpacing} from '../../theme/utils';

interface IWalkthroughProps {
  onPressClose: () => void;
  onPressTutorial: () => void;
}

const Walkthrough: FC<IWalkthroughProps> = props => {
  return (
    <View flex padding-12 center backgroundColor="white">
      <Text center text40L primary>
        Welcome to Zon
      </Text>
      <Text text70L grey30 marginT-6 marginH-24>
        If you haven't played before, consider having a look at the tutorial.
      </Text>

      <View style={{position: 'absolute', bottom: 12, left: 12, right: 12}}>
        <Button onPress={props.onPressTutorial} marginT-6 label="How To Play" />
        <View marginB-6 />
        <Button outline label="Play Now" onPress={props.onPressClose} />
      </View>
    </View>
  );
};

export default Walkthrough;
