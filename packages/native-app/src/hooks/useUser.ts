import {createContext, useContext} from 'react';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';

export const UserContext = createContext<FirebaseAuthTypes.User | null>(null);

export const useUser = () => {
  const user = useContext(UserContext);
  return user!;
};
