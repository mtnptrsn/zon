import React, {FC} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {View, Text} from 'react-native-ui-lib';

const HelpScreen: FC = () => {
  return (
    <ScrollView style={{flex: 1}}>
      <View padding-12>
        <Text marginB-6 text50L>
          Normal
        </Text>
        <Text text70L>
          Collect as many zones as you can. The further away a zone is, the
          higher the reward.
        </Text>

        <Text marginB-6 text50L marginT-24>
          Domination
        </Text>
        <Text text70L>
          Zones reward you with points over time. It's possible to steal zones
          from others to make them work for you instead.
        </Text>
      </View>
    </ScrollView>
  );
};

export default HelpScreen;
