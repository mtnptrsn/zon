import {GeolocationResponse} from '@react-native-community/geolocation';
import {StackActions, useNavigation} from '@react-navigation/core';
import React, {FC, useContext, useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {
  Button,
  Checkbox,
  KeyboardAwareScrollView,
  LoaderScreen,
  Picker,
  Slider,
  Text,
  View,
} from 'react-native-ui-lib';
import useStoredState from '../../../hooks/useAsyncStorage';
import {useUser} from '../../../hooks/useUser';
import {SocketContext} from '../../../socket/context';
import {metersToYards} from '../../../utils/units';

interface ILobbyScreenProps {
  room: any;
  position: GeolocationResponse;
}

const LobbyScreen: FC<ILobbyScreenProps> = props => {
  const user = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [hardmode, setHardMode] = useState(
    props.room.challengeRoom?.flags?.HARDMODE || false,
  );
  const [measurementSystem, setMeasurementSystem] = useStoredState(
    'measurementSystem',
    'metric',
  );
  const navigation = useNavigation();
  const socket = useContext(SocketContext);
  const userId = user.uid;
  const roomHost = props.room.players.find((player: any) => player.isHost);
  const isHost = userId === roomHost._id;
  const player = props.room.players.find(
    (player: any) => player._id === userId,
  );
  const [settings, setSettings] = useState({
    duration: props.room.challengeRoom?.duration / 60 / 1000 || 30,
    radius: props.room.challengeRoom?.map?.radius || 1500,
  });
  const hasAccuratePositon =
    props.position.coords.latitude !== 0 &&
    props.position.coords.longitude !== 0;

  const mapSizeHelperText =
    measurementSystem === 'metric'
      ? `${settings.radius} meters in radius`
      : `${Math.round(metersToYards(settings.radius))} yards in radius`;

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

  const onChangeMeasurementSystem = ({
    value,
  }: {
    value: string;
    label: string;
  }) => {
    setMeasurementSystem(value);
  };

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

    // if (ENV === 'production') analytics().logEvent('start_game');

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
    const ghosts =
      props.room.challengeRoom?.players?.map((player: any) => {
        return {
          ...player,
          name: `Ghost ${player.name}`,
          isGhost: true,
        };
      }) || [];

    return [...props.room.players, ...ghosts].map((player: any) => {
      const key = `${player._id}-${player.isGhost ? '_ghost' : ''}`;

      return (
        <View key={key} marginB-6>
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
              {player.name}
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

          {isHost && (
            <View>
              <Text text60L marginT-16>
                Settings
              </Text>
              <View
                marginT-6
                height={1}
                width="100%"
                backgroundColor="#e3e3e3"
              />

              <Text text80 marginT-12>
                Duration
              </Text>
              <Slider
                disabled={Boolean(props.room.challengeRoom)}
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
                disabled={Boolean(props.room.challengeRoom)}
                step={1}
                minimumValue={1000}
                maximumValue={2000}
                value={settings.radius}
                onValueChange={(value: any) => {
                  setSettings(settings => ({...settings, radius: value}));
                }}
              />
              <Text grey30>{mapSizeHelperText}</Text>

              <View marginT-16 />

              <Checkbox
                disabled={Boolean(props.room.challengeRoom)}
                value={hardmode}
                onValueChange={setHardMode}
                label={'Hardmode'}
              />
              <Text grey30 marginT-6>
                In hardmode you can't see your current position.
              </Text>
            </View>
          )}

          <Text text80 marginT-12>
            Units of Measure
          </Text>
          <Picker
            onChange={onChangeMeasurementSystem}
            value={measurementSystem}>
            <Picker.Item value={'metric'} label="Metric"></Picker.Item>
            <Picker.Item value={'imperial'} label="Imperial"></Picker.Item>
          </Picker>

          {/* <View marginT-12 /> */}

          {/* <Checkbox
            value={tutorial}
            onValueChange={setTutorial}
            label={'Tutorial'}
          />
          <Text grey30 marginT-6>
            The rules will be explained to you while you play. Recommended for
            new players.
          </Text> */}
        </View>

        <View marginT-24>
          {isHost && (
            <Button
              disabled={!hasAccuratePositon}
              onPress={onPressStart}
              label="Start"
              loading={!hasAccuratePositon || isLoading}></Button>
          )}
          <Button marginT-6 outline label="Invite" onPress={onPressInvite} />
          <Button marginT-6 outline onPress={onPressLeave} label="Leave" />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default LobbyScreen;
