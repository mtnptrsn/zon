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
      <Text text70L grey30 marginV-12>
        Please consider having a look at the walkthrough. Zon is easy to learn,
        but you will benefit from having a basic understanding of the game
        before you play.
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
          First Phase: Capture <Text text50BL>your</Text> zone
        </Text>

        <Text grey30 text70L marginT-6>
          As soon as the game starts, you will be assigned with a zone, which
          you'll have to take before taking any other zones. This zone will be
          marked with green.
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
          Second Phase: Capture zones
        </Text>

        <Text grey30 text70L marginT-6>
          After capturing your first zone, you're free to take all other zones.
        </Text>

        <Text grey30 text70L marginT-6>
          Available zones will be marked with green, but could also be the color
          of the player who captured it. Depending on the game mode, you might
          be able to steal zones from other players.
        </Text>

        <Text primary text60BL marginT-12>
          Mode: Normal
        </Text>

        <Text grey30 text70L marginT-6>
          In normal mode, you can only take a zone once. As soon as you've
          captured a point, no one else can capture it again or steal it from
          you.
        </Text>

        <Text primary text60BL marginT-12>
          Mode: Control
        </Text>
        <Text grey30 text70L marginT-6>
          In control mode, you can steal zones from others, however, zones are
          secured for 3 minutes after being captured. Locked zones will be
          marked with a lock symbol.
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

        <Text grey30 text70L marginT-6>
          Different zones give different amount of points. The further away from
          the starting position (home) the more points a zone gives.
        </Text>

        <Text primary text60BL marginT-12>
          Mode: Normal
        </Text>
        <Text grey30 text70L marginT-6>
          When you catch a zone, you are awarded immediately.
        </Text>

        <Text primary text60BL marginT-12>
          Mode: Control
        </Text>
        <Text grey30 text70L marginT-6>
          When you catch a point, you aren't immediately awarded. Instead, zones
          give you points over time.
        </Text>
      </ScrollView>
      <View style={{marginTop: 'auto'}} row spread padding-12>
        <Button outline label="Back" onPress={props.onPressBack} />
        <Button label="Next" onPress={props.onPressNext} />
      </View>
    </View>
  );
};

const Home: FC<IStepProps> = props => {
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
          Home
        </Text>

        <Text grey30 text70L marginT-6>
          The home is wherever you started the game and is marked with a blue
          circle. Make sure to be back home before the time runs out, or you
          will be disqualified.
        </Text>
      </ScrollView>
      <View style={{marginTop: 'auto'}} row spread padding-12>
        <Button outline label="Back" onPress={props.onPressBack} />
        <Button label="Finish" onPress={props.onPressClose} />
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
    Home,
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
