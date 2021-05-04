import React, {FC} from 'react';
import {View, Text, Spacings} from 'react-native-ui-lib';

interface IUpdateScreenProps {
  version: string;
  latestVersion: string;
}

const UpdateScreen: FC<IUpdateScreenProps> = props => {
  return (
    <View flex center margin-24>
      <Text text50 primary>
        Hooray! There is a new update available! In order to play, you need to
        update the app.
      </Text>

      <Text grey30 marginT-12>
        Your version: {props.version}
      </Text>
      <Text grey30>Latest version: {props.latestVersion}</Text>
    </View>
  );
};

export default UpdateScreen;
