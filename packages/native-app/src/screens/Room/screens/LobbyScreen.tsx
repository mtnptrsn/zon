import {StackActions, useNavigation} from '@react-navigation/core';
import React, {FC, useContext, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {getUniqueId} from 'react-native-device-info';
import {Text, Slider, useTheme} from 'react-native-elements';
import {Button} from 'react-native-elements';
import {SocketContext} from '../../../socket/context';
import {getSpacing} from '../../../theme/utils';
import GeoLocation, {
  GeolocationError,
  GeolocationResponse,
} from '@react-native-community/geolocation';

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
  const [customMap, setCustomMap] = useState([]);
  const hasCustomMap = customMap.length > 0;
  const navigation = useNavigation();
  const socket = useContext(SocketContext);
  const userId = getUniqueId();
  const roomHost = props.room.players.find((player: any) => player.isHost);
  const isHost = userId === roomHost._id;
  const [settings, setSettings] = useState({duration: 30, radius: 1500});
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
        map: customMap,
      },
      () => {},
    );
  };

  const onPressCreateCustomMap = () => {
    return navigation.navigate('CreateMap', {
      state: {set: setCustomMap, get: () => customMap},
      position: props.position,
    });
  };

  const onPressDeleteCustomMap = () => {
    setCustomMap([]);
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

          <View
            pointerEvents={hasCustomMap ? 'none' : 'auto'}
            style={{opacity: hasCustomMap ? 0.5 : 1}}>
            <Text style={styles.sliderTitle}>Map Size</Text>
            <Slider
              thumbStyle={{height: 30, width: 30}}
              thumbTintColor={theme.theme.colors!.primary}
              step={100}
              minimumValue={200}
              maximumValue={5000}
              value={settings.radius}
              onValueChange={(value: any) => {
                setSettings({...settings, radius: value});
              }}
            />
            <Text style={styles.sliderValue}>
              {settings.radius} meters in radius
            </Text>
          </View>

          <View style={{flexDirection: 'row', marginTop: getSpacing(1)}}>
            <Button
              onPress={onPressCreateCustomMap}
              containerStyle={styles.createMapButton}
              type="outline"
              title={hasCustomMap ? 'Edit' : 'Create Custom Map'}
              loading={!hasAccuratePositon}
            />
            {hasCustomMap && (
              <Button
                onPress={onPressDeleteCustomMap}
                type="outline"
                title={'Delete'}
              />
            )}
          </View>
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
            loading={!hasAccuratePositon}
          />
        )}
      </View>
    </View>
  );
};

export default LobbyScreen;
