import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useEffect, useState} from 'react';

export const useAuthStateChanged = (): [
  boolean,
  null | FirebaseAuthTypes.User,
  string | null,
] => {
  const [loading, setIsLoading] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    if (user) {
      return user.getIdToken().then(token => {
        setToken(token);
        setUser(user);
        setIsLoading(false);
      });
    }

    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(onAuthStateChanged);
    return unsubscribe;
  }, []);

  return [loading, user, token];
};
