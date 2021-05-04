import React, {FC} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {View, Text} from 'react-native-ui-lib';

const HelpScreen: FC = () => {
  return (
    <ScrollView style={{flex: 1}}>
      <View padding-12>
        <Text marginB-6 text60L>
          Normal
        </Text>
        <Text grey30 text70L>
          Collect as many zones as you can. The further away a zone is, the
          higher the reward. A zone can only be taken once.
        </Text>

        <Text marginB-6 text60L marginT-24>
          Control
        </Text>
        <Text grey30 text70L>
          Zones reward you with points over time. It's possible to steal zones
          from others to make them work for you instead.
        </Text>
      </View>
    </ScrollView>
  );
};

export default HelpScreen;
