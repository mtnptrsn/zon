import {useNavigation} from '@react-navigation/core';
import React, {FC, useContext, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {getUniqueId} from 'react-native-device-info';
import {Text, Slider, useTheme} from 'react-native-elements';
import {Button} from 'react-native-elements';
import {SocketContext} from '../../../socket/context';
import {getSpacing} from '../../../theme/utils';
import GeoLocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';

interface ILobbyScreenProps {
  room: any;
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
    marginTop: getSpacing(1),
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
});

const LobbyScreen: FC<ILobbyScreenProps> = props => {
  const navigation = useNavigation();
  const socket = useContext(SocketContext);
  const userId = getUniqueId();
  const roomHost = props.room.players.find((player: any) => player.isHost);
  const isHost = userId === roomHost._id;
  const [settings, setSettings] = useState({duration: 30, radius: 1500});
  const theme = useTheme();

  const onPressInvite = () => {
    navigation.navigate('ShowQR', {data: props.room._id, title: 'Invite'});
  };

  const onPressLeave = () => navigation.goBack();

  const onPressStart = async () => {
    const currentPosition = await new Promise<GeolocationResponse>(resolve => {
      GeoLocation.getCurrentPosition(data => resolve(data));
    });

    socket!.emit(
      'start:room',
      {
        roomId: props.room._id,
        duration: 1000 * 60 * settings.duration,
        radius: settings.radius,
        hostLocation: [
          currentPosition.coords.longitude,
          currentPosition.coords.latitude,
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
              setSettings({...settings, duration: value});
            }}
            maximumValue={60 * 2}
            minimumValue={1}
            step={1}
          />
          <Text style={styles.sliderValue}>{settings.duration} minutes</Text>

          <Text style={styles.sliderTitle}>Map Size</Text>
          <Slider
            thumbStyle={{height: 30, width: 30}}
            thumbTintColor={theme.theme.colors!.primary}
            step={100}
            minimumValue={500}
            maximumValue={5000}
            value={settings.radius}
            onValueChange={(value: any) => {
              setSettings({...settings, radius: value});
            }}
          />
          <Text style={styles.sliderValue}>{settings.radius} meters</Text>
        </View>
      )}

      <View style={styles.buttons}>
        <Button onPress={onPressLeave} title="Leave" type="outline" />
        {isHost && (
          <Button
            onPress={onPressStart}
            containerStyle={styles.startButton}
            title="Start"
          />
        )}
      </View>
    </View>
  );
};

export default LobbyScreen;
