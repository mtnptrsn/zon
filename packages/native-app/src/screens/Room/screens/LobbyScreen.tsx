import {StackActions, useNavigation} from '@react-navigation/core';
import React, {FC, useContext, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {getUniqueId} from 'react-native-device-info';
import {Text, Slider, useTheme} from 'react-native-elements';
import {Button} from 'react-native-elements';
import {SocketContext} from '../../../socket/context';
import {getSpacing} from '../../../theme/utils';
import {GeolocationResponse} from '@react-native-community/geolocation';

interface ILobbyScreenProps {
  room: any;
  position: GeolocationResponse;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: getSpacing(1),
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteButton: {
    marginLeft: getSpacing(1),
  },
  playerText: {
    fontSize: 16,
  },
  buttons: {
    marginTop: 'auto',
  },
  startButton: {
    marginTop: getSpacing(0.5),
  },
  playerColor: {
    width: 20,
    height: 20,
    borderRadius: 99,
    marginRight: getSpacing(0.5),
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getSpacing(1),
  },
  settingsContainer: {
    marginTop: getSpacing(2),
  },
  sliderTitle: {
    fontSize: 16,
    marginTop: getSpacing(1),
  },
  sliderValue: {
    color: 'rgba(0,0,0,.6)',
  },
  createMapButton: {
    marginRight: getSpacing(1),
  },
});

const LobbyScreen: FC<ILobbyScreenProps> = props => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const socket = useContext(SocketContext);
  const userId = getUniqueId();
  const roomHost = props.room.players.find((player: any) => player.isHost);
  const isHost = userId === roomHost._id;
  const [settings, setSettings] = useState({duration: 40, radius: 2000});
  const theme = useTheme();
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
        <View key={player._id} style={styles.playerContainer}>
          <View
            style={[
              styles.playerColor,
              {
                backgroundColor: player.color,
              },
            ]}
          />
          <Text style={styles.playerText}>{player.name}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.playerHeader}>
        <Text h4>Players</Text>
        <Button
          onPress={onPressInvite}
          containerStyle={styles.inviteButton}
          title="Invite"
        />
      </View>
      {renderPlayers()}

      {isHost && (
        <View style={styles.settingsContainer}>
          <Text h4>Settings</Text>
          <Text style={styles.sliderTitle}>Duration</Text>
          <Slider
            thumbStyle={{height: 30, width: 30}}
            thumbTintColor={theme.theme.colors!.primary}
            value={settings.duration}
            onValueChange={(value: any) => {
              setSettings(settings => ({...settings, duration: value}));
            }}
            maximumValue={80}
            minimumValue={10}
            step={1}
          />
          <Text style={styles.sliderValue}>{settings.duration} minutes</Text>

          <Text style={styles.sliderTitle}>Map Size</Text>
          <Slider
            thumbStyle={{height: 30, width: 30}}
            thumbTintColor={theme.theme.colors!.primary}
            step={100}
            minimumValue={1000}
            maximumValue={2500}
            value={settings.radius}
            onValueChange={(value: any) => {
              setSettings(settings => ({...settings, radius: value}));
            }}
          />
          <Text style={styles.sliderValue}>
            {settings.radius} meters in radius
          </Text>
        </View>
      )}

      <View style={styles.buttons}>
        <Button onPress={onPressLeave} title="Leave" type="outline" />
        {isHost && (
          <Button
            disabled={!hasAccuratePositon}
            onPress={onPressStart}
            containerStyle={styles.startButton}
            title="Start"
            loading={!hasAccuratePositon || isLoading}
          />
        )}
      </View>
    </View>
  );
};

export default LobbyScreen;
