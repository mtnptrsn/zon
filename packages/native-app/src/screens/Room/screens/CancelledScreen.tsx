import {GeolocationResponse} from '@react-native-community/geolocation';
import React, {FC} from 'react';
import {Text} from 'react-native-elements';

interface IStatScreenProps {
  room: any;
  position: GeolocationResponse;
}

const CancelledScreen: FC<IStatScreenProps> = () => {
  return <Text>The game was cancelled.</Text>;
};

export default CancelledScreen;
