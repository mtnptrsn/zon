import React, {FC} from 'react';
import {Text} from 'react-native-elements';

interface IStatScreenProps {
  room: any;
}

const CancelledScreen: FC<IStatScreenProps> = () => {
  return <Text>The game was cancelled.</Text>;
};

export default CancelledScreen;
