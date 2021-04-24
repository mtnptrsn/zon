import {useNavigation, useRoute} from '@react-navigation/core';
import React, {FC, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

  return (
    <View style={styles.container}>
      <QRCode size={200} value={data} />
    </View>
  );
};

export default ShowQRScreen;
