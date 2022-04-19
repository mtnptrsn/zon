import {GeolocationResponse} from '@react-native-community/geolocation';
import analytics from '@react-native-firebase/analytics';
import {StackActions, useNavigation} from '@react-navigation/core';
import React, {FC, useContext, useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {getUniqueId} from 'react-native-device-info';
import {ENV} from 'react-native-dotenv';
import {
  Button,
  Checkbox,
  KeyboardAwareScrollView,
  LoaderScreen,
  Slider,
  Text,
  View,
} from 'react-native-ui-lib';
import useStoredState from '../../../hooks/useAsyncStorage';
import {SocketContext} from '../../../socket/context';

interface ILobbyScreenProps {
  room: any;
  position: GeolocationResponse;
}

const LobbyScreen: FC<ILobbyScreenProps> = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [hardmode, setHardMode] = useState(false);
  const [tutorial, setTutorial] = useStoredState('tutorial', true);
  const navigation = useNavigation();
  const socket = useContext(SocketContext);
  const userId = getUniqueId();
  const roomHost = props.room.players.find((player: any) => player.isHost);
  const isHost = userId === roomHost._id;
  const player = props.room.players.find(
    (player: any) => player._id === userId,
  );
  const [settings, setSettings] = useState({
    duration: 35,
    radius: 1500,
  });
  const hasAccuratePositon =
    props.position.coords.latitude !== 0 &&
    props.position.coords.longitude !== 0;

  useEffect(() => {
    if (hasAccuratePositon) {
      socket!.emit('user:updatePosition:lobby', {
        roomId: props.room._id,
        playerId: player._id,
        coordinate: [
          props.position.coords.longitude,
          props.position.coords.latitude,
        ],
      });
    }
  }, [props.position.coords]);

  const onPressInvite = () => {
    navigation.navigate('ShowQR', {data: props.room.shortId, title: 'Invite'});
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
    <KeyboardAwareScrollView>
      <View padding-12>
        <View>
          <Text text60L>Players</Text>
          <View marginT-6 height={1} width="100%" backgroundColor="#e3e3e3" />
          <View marginT-12>{renderPlayers()}</View>

          <Text text60L marginT-16>
            Settings
          </Text>
          <View marginT-6 height={1} width="100%" backgroundColor="#e3e3e3" />

          {isHost && (
            <View>
              <Text text80 marginT-12>
                Duration
              </Text>
              <Slider
                value={settings.duration}
                onValueChange={(value: any) => {
                  setSettings(settings => ({...settings, duration: value}));
                }}
                maximumValue={60}
                minimumValue={1}
                step={1}
              />
              <Text grey30>{settings.duration} minutes</Text>

              <Text text80 marginT-12>
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

              <View marginT-16 />

              <Checkbox
                value={hardmode}
                onValueChange={setHardMode}
                label={'Hardmode'}
              />
              <Text grey30 marginT-6>
                In hardmode you can't see your current position. Only suitable
                for experienced players.
              </Text>
            </View>
          )}

          <View marginT-12 />

          <Checkbox
            value={tutorial}
            onValueChange={setTutorial}
            label={'Tutorial'}
          />
          <Text grey30 marginT-6>
            The rules will be explained while you play. Make sure to have sound
            turned on for better convinience.
          </Text>
        </View>

        <View marginT-24>
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
    </KeyboardAwareScrollView>
  );
};

export default LobbyScreen;
