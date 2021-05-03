import {StackActions, useNavigation} from '@react-navigation/core';
import React, {FC, useContext, useState} from 'react';
import {Alert, StyleSheet} from 'react-native';
import {getUniqueId} from 'react-native-device-info';
import {useTheme} from 'react-native-elements';
import {Text, Slider, View, Button, LoaderScreen} from 'react-native-ui-lib';
// import {Button} from 'react-native-elements';
import {SocketContext} from '../../../socket/context';
import {getSpacing} from '../../../theme/utils';
import {GeolocationResponse} from '@react-native-community/geolocation';
interface ILobbyScreenProps {
  room: any;
  position: GeolocationResponse;
}

const LobbyScreen: FC<ILobbyScreenProps> = props => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const socket = useContext(SocketContext);
  const userId = getUniqueId();
  const roomHost = props.room.players.find((player: any) => player.isHost);
  const isHost = userId === roomHost._id;
  const [settings, setSettings] = useState({duration: 40, radius: 2000});
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

    socket!.emit(
      'room:update:start',
      {
        roomId: props.room._id,
        duration: 1000 * 60 * settings.duration,
        radius: settings.radius,
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
      return (
        <View key={player._id} row centerV marginB-6>
          <View backgroundColor={player.color} height={25} width={25} br100 />
          <Text text70 marginL-8>
            {player.name}
          </Text>
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
        <View marginT-12>{renderPlayers()}</View>

        {isHost && (
          <View marginT-24>
            <Text text50L>Settings</Text>
            <Text text70 marginT-12>
              Duration
            </Text>
            <Slider
              value={settings.duration}
              onValueChange={(value: any) => {
                setSettings(settings => ({...settings, duration: value}));
              }}
              maximumValue={80}
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
              maximumValue={2500}
              value={settings.radius}
              onValueChange={(value: any) => {
                setSettings(settings => ({...settings, radius: value}));
              }}
            />
            <Text grey30>{settings.radius} meters in radius</Text>
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
