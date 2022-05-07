import React, {FC, useEffect} from 'react';
import {Button, Text, View} from 'react-native-ui-lib';

import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';

const AuthScreen: FC = () => {
  const onSignIn = async () => {
    const {idToken} = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
  };

  return (
    <View flex backgroundColor="white" center>
      <Text text50 marginB-12>
        Welcome to Zon
      </Text>
      <Text marginB-6 text70>
        Please log in to continue
      </Text>
      <GoogleSigninButton onPress={onSignIn} />
    </View>
  );
};

export default AuthScreen;
