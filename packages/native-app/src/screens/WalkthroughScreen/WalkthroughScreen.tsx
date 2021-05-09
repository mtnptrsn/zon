import MapboxGL from '@react-native-mapbox-gl/maps';
import {useRoute} from '@react-navigation/core';
import React, {FC, useState} from 'react';
import {Dimensions, ScrollView} from 'react-native';
import {View, Text, Button, Image} from 'react-native-ui-lib';
import {getSpacing} from '../../theme/utils';

interface IWalkthroughProps {
  onPressClose: () => void;
  showPrompt: boolean;
}

interface IStepProps {
  onPressNext: () => void;
  onPressBack: () => void;
  onPressClose: () => void;
}

const WINDOW_WIDTH = Dimensions.get('window').width;

const Prompt: FC<IStepProps> = props => {
  return (
    <View flex padding-12 center>
      <Text center text40L primary>
        Welcome to Zon
      </Text>
      <Text text70L grey30 marginT-6 marginH-24>
        If you haven't played before, consider having a look at the walkthrough.
      </Text>

      <View style={{position: 'absolute', bottom: 12, left: 12, right: 12}}>
        <Button outline label="Play Now" onPress={props.onPressClose} />
        <Button onPress={props.onPressNext} marginT-6 label="Walkthrough" />
      </View>
    </View>
  );
};

const FirstZone: FC<IStepProps> = props => {
  return (
    <View flex>
      <Image
        width={WINDOW_WIDTH}
        style={{flex: 1}}
        source={require('../../../assets/images/guide/first-zone.jpg')}
      />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{padding: getSpacing(1)}}>
        <Text primary text50L>
          Objective 1: Capture The First Zone
        </Text>
        <Text grey30 text70L marginT-12>
          When the game begins, you will notice that you're inside a blue area
          on the map. This is your home. You are allowed to leave the home, but
          make sure to be back before the time runs out.
        </Text>
        <Text grey30 text70L marginT-12>
          Now it's time to capture zones. This first zone will be assigned to
          you and you are required to take this zone before you can take other
          zones.
        </Text>
      </ScrollView>
      <View padding-12 style={{marginTop: 'auto'}} row spread>
        <Button onPress={props.onPressBack} outline label="Back" />
        <Button onPress={props.onPressNext} label="Next" />
      </View>
    </View>
  );
};

const AfterFirstZone: FC<IStepProps> = props => {
  return (
    <View flex>
      <Image
        style={{flex: 1}}
        width={WINDOW_WIDTH}
        source={require('../../../assets/images/guide/after-first-zone.jpg')}
      />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{padding: getSpacing(1)}}>
        <Text primary text50L>
          Objective 2: Capture Zones
        </Text>

        <Text grey30 text70L marginT-12>
          After capturing your first zone, you're free to take more zones.
        </Text>

        <Text grey30 text70L marginT-12>
          Available zones will be marked with green, but could also be the color
          of the player who captured it. Depending on the game mode, you might
          be able to steal zones from other players.
        </Text>
      </ScrollView>
      <View style={{marginTop: 'auto'}} row spread padding-12>
        <Button outline label="Back" onPress={props.onPressBack} />
        <Button label="Next" onPress={props.onPressNext} />
      </View>
    </View>
  );
};

const Distance: FC<IStepProps> = props => {
  return (
    <View flex>
      <Image
        style={{flex: 1}}
        width={WINDOW_WIDTH}
        source={require('../../../assets/images/guide/distance.jpg')}
      />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{padding: getSpacing(1)}}>
        <Text primary text50L>
          Zone Weights
        </Text>

        <Text grey30 text70L marginT-12>
          Different zones give different amount of points. The further away from
          the starting position (home) the more points a zone yields.
        </Text>
      </ScrollView>
      <View style={{marginTop: 'auto'}} row spread padding-12>
        <Button outline label="Back" onPress={props.onPressBack} />
        <Button label="Next" onPress={props.onPressNext} />
      </View>
    </View>
  );
};

const BackHome: FC<IStepProps> = props => {
  return (
    <View flex>
      <Image
        style={{flex: 1}}
        width={WINDOW_WIDTH}
        source={require('../../../assets/images/guide/home.jpg')}
      />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{padding: getSpacing(1)}}>
        <Text primary text50L>
          Objective 3: Get Back Home
        </Text>

        <Text grey30 text70L marginT-12>
          Make sure to get back home before the time runs out. If you don't
          manage to get back in time, you will be disqualified.
        </Text>
      </ScrollView>
      <View style={{marginTop: 'auto'}} row spread padding-12>
        <Button outline label="Back" onPress={props.onPressBack} />
        <Button label="Next" onPress={props.onPressNext} />
      </View>
    </View>
  );
};

const GameModes: FC<IStepProps> = props => {
  return (
    <View flex>
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{padding: getSpacing(1)}}>
        <Text primary text50L>
          Game Modes
        </Text>

        <Text primary text60L marginT-12>
          Normal
        </Text>

        <Text grey30 text70L marginT-6>
          Capture as many zones as you can. When a zone is taken, no one else
          can take it from you. You earn points immediately as you capture a
          zone.
        </Text>

        <Text primary text60L marginT-12>
          Control
        </Text>

        <Text grey30 text70L marginT-6>
          Capture as many zones as you can. When a zone is taken, it will be
          yours for at least 3 minutes. After 3 minutes, other players can steal
          it from you. You aren't rewarded immediately when you capture a zone.
          Instead, each zone you control yields you points over time.
        </Text>
      </ScrollView>
      <View style={{marginTop: 'auto'}} row spread padding-12>
        <Button outline label="Back" onPress={props.onPressBack} />
        <Button label="Play Now" onPress={props.onPressClose} />
      </View>
    </View>
  );
};

const Walkthrough: FC<IWalkthroughProps> = props => {
  const [page, setPage] = useState(0);
  const pages = [
    ...(props.showPrompt ? [Prompt] : []),
    FirstZone,
    AfterFirstZone,
    Distance,
    BackHome,
    GameModes,
  ];
  const Component: FC<IStepProps> = pages[page];
  return (
    <Component
      onPressBack={() => setPage(page => Math.max(0, page - 1))}
      onPressNext={() => setPage(page => Math.min(pages.length - 1, page + 1))}
      onPressClose={props.onPressClose}
    />
  );
};

export default Walkthrough;
