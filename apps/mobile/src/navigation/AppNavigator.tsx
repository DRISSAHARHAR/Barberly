import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useAppSelector } from '../store';
import { BarberNavigator } from './BarberNavigator';
import { ClientNavigator } from './ClientNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const role = useAppSelector((state) => state.auth.user?.role);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === 'BARBER' ? (
        <Stack.Screen name="BarberApp" component={BarberNavigator} />
      ) : (
        <Stack.Screen name="ClientApp" component={ClientNavigator} />
      )}
    </Stack.Navigator>
  );
};
