import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ProfileScreen } from '../screens/client/ProfileScreen';

const Stack = createNativeStackNavigator();

export const ClientNavigator: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="ClientProfile" component={ProfileScreen} options={{ title: 'Profil client' }} />
  </Stack.Navigator>
);
