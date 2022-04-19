import {useNavigation, useRoute} from '@react-navigation/core';
import React, {FC, useEffect} from 'react';
import {Share, StyleSheet, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {Button, Text} from 'react-native-ui-lib';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    maxWidth: 250,
  },
});

const ShowQRScreen: FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const data = (route.params! as any).data;
  const title = (route.params! as any).title;

  useEffect(() => {
    navigation.setOptions({headerTitle: title});
  }, []);

  const share = () => {
    Share.share({
      message: `Join my game on Zon with code: ${data}`,
    });
  };

  return (
    <View style={styles.container}>
      <QRCode size={200} value={data} />
      <View style={styles.textContainer}>
        <Text grey30 center marginT-12>
          Your friends can scan this QR code to join your game.
        </Text>
        <Button
          marginT-24
          label="Invite Remote Players"
          outline
          onPress={share}
        />
      </View>
    </View>
  );
};

export default ShowQRScreen;
