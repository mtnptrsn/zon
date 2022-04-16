import {StackActions, useNavigation} from '@react-navigation/core';
import React, {FC, useContext, useState} from 'react';
import {Alert} from 'react-native';
import {getUniqueId} from 'react-native-device-info';
import {
  Text,
  Slider,
  View,
  Button,
  LoaderScreen,
  Picker,
  Colors,
  Checkbox,
} from 'react-native-ui-lib';
import {SocketContext} from '../../../socket/context';
import {GeolocationResponse} from '@react-native-community/geolocation';
import analytics from '@react-native-firebase/analytics';
import {ENV} from 'react-native-dotenv';

interface ILobbyScreenProps {
  room: any;
  position: GeolocationResponse;
}

const LobbyScreen: FC<ILobbyScreenProps> = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [gameMode, setGameMode] = useState('normal');
  const [hardmode, setHardMode] = useState(false);
  const navigation = useNavigation();
  const socket = useContext(SocketContext);
  const userId = getUniqueId();
  const roomHost = props.room.players.find((player: any) => player.isHost);
  const isHost = userId === roomHost._id;
  const [settings, setSettings] = useState({
    duration: 35,
    radius: 1500,
  });
  const hasAccuratePositon =
    props.position.coords.latitude !== 0 &&
    props.position.coords.longitude !== 0;

  const onPressInvite = () => {
    navigation.navigate('ShowQR', {data: props.room._id, title: 'Invite'});
  };

  const onPressLeave = () => {
    const leave = () => navigation.dispatch(StackActions.popToTop());
    Alert.alert('Confirmation', 'Are you sure you want to leave the game?', [
      {text: 'No', onPress: () => {}},
      {text: 'Yes', onPress: leave},
    ]);
  };

  const onPressStart = async () => {
    setIsLoading(true);

    if (!hasAccuratePositon)
      return Alert.alert('Error', `Couldn't get your location.`);

    if (ENV === 'production') analytics().logEvent('start_game');

    socket!.emit(
      'room:update:start',
      {
        roomId: props.room._id,
        duration: 1000 * 60 * settings.duration,
        radius: settings.radius,
        hardmode,
        hostLocation: [
          props.position.coords.longitude,
          props.position.coords.latitude,
        ],
      },
      () => {},
    );
  };

  const renderPlayers = () => {
    return props.room.players.map((player: any) => {
      const isCurrentPlayer = player._id === getUniqueId();

      return (
        <View key={player._id} marginB-6>
          <View row centerV>
            <View
              center
              backgroundColor={player.color}
              height={33}
              width={33}
              br100>
              <Text
                style={{
                  textShadowColor: 'rgba(0,0,0,.5)',
                  textShadowOffset: {width: 0, height: 0},
                  textShadowRadius: 3,
                }}
                text70L
                white>
                {player.name.substring(0, 1).toUpperCase()}
              </Text>
            </View>
            <Text text70L marginL-8>
              {isCurrentPlayer ? 'You' : player.name}
            </Text>
          </View>
        </View>
      );
    });
  };

  if (!hasAccuratePositon) return <LoaderScreen message="Finding position" />;
  if (isLoading) return <LoaderScreen message="Creating map" />;

  return (
    <View padding-12 flex>
      <View flex>
        <Text text50L>Players</Text>
        <View marginB-24 marginT-12>
          {renderPlayers()}
        </View>

        {isHost && (
          <View>
            <Text text50L>Settings</Text>
            <Text text70 marginT-12>
              Duration
            </Text>
            <Slider
              value={settings.duration}
              onValueChange={(value: any) => {
                setSettings(settings => ({...settings, duration: value}));
              }}
              maximumValue={60}
              minimumValue={10}
              step={1}
            />
            <Text grey30>{settings.duration} minutes</Text>

            <Text text70 marginT-12>
              Map Size
            </Text>
            <Slider
              step={1}
              minimumValue={1000}
              maximumValue={2000}
              value={settings.radius}
              onValueChange={(value: any) => {
                setSettings(settings => ({...settings, radius: value}));
              }}
            />
            <Text grey30>{settings.radius} meters in radius</Text>

            <View marginT-24 />

            <Checkbox
              value={hardmode}
              onValueChange={setHardMode}
              label={'Hardmode'}
            />
            <Text grey30 marginT-12>
              In hardmode you can't see your current position. Only suitable for
              experienced players.
            </Text>
          </View>
        )}
      </View>

      <View>
        <Button outline onPress={onPressLeave} label="Leave" />
        <Button marginT-6 outline label="Invite" onPress={onPressInvite} />
        {isHost && (
          <Button
            marginT-6
            disabled={!hasAccuratePositon}
            onPress={onPressStart}
            label="Start"
            loading={!hasAccuratePositon || isLoading}></Button>
        )}
      </View>
    </View>
  );
};

export default LobbyScreen;
