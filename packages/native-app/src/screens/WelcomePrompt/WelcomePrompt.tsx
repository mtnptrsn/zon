import MapboxGL from '@rnmapbox/maps';
import {useRoute} from '@react-navigation/core';
import React, {FC, useState} from 'react';
import {Dimensions, ScrollView} from 'react-native';
import {View, Text, Button, Image, Colors} from 'react-native-ui-lib';
import {getSpacing} from '../../theme/utils';
import {SafeAreaView} from 'react-native-safe-area-context';

interface IWalkthroughProps {
  onPressClose: () => void;
  onPressTutorial: () => void;
}

const Walkthrough: FC<IWalkthroughProps> = props => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <View flex padding-12 center backgroundColor={Colors.white}>
        <Text center text40L primary>
          Tutorial
        </Text>
        <Text text70L grey30 marginT-6 marginH-24>
          If you haven't played before, consider having a look at the tutorial.
        </Text>

        <View style={{position: 'absolute', bottom: 12, left: 12, right: 12}}>
          <Button
            onPress={props.onPressTutorial}
            marginT-6
            label="Watch Tutorial"
          />
          <View marginB-6 />
          <Button outline label="Skip Tutorial" onPress={props.onPressClose} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Walkthrough;
