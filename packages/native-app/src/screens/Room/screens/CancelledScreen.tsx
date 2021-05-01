import {GeolocationResponse} from '@react-native-community/geolocation';
import {StackActions, useNavigation} from '@react-navigation/core';
import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, Button} from 'react-native-elements';
import {getSpacing} from '../../../theme/utils';

interface IStatScreenProps {
  room: any;
  position: GeolocationResponse;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: getSpacing(1),
    justifyContent: 'space-between',
  },
});

const CancelledScreen: FC<IStatScreenProps> = () => {
  const navigation = useNavigation();
  const onPressClose = () => {
    navigation.dispatch(StackActions.popToTop());
  };
  return (
    <View style={styles.container}>
      <Text>The game was cancelled.</Text>
      <Button onPress={onPressClose} title="Close" />
    </View>
  );
};

export default CancelledScreen;
