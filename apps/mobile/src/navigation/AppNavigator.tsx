import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ProfileScreen } from '../screens/client/ProfileScreen';
import { BarberDashboardScreen } from '../screens/barber/BarberDashboardScreen';
import { useAppSelector } from '../store';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const role = useAppSelector((state) => state.auth.user?.role);

  return (
    <Stack.Navigator>
      {role === 'BARBER' ? (
        <Stack.Screen name="BarberDashboard" component={BarberDashboardScreen} options={{ title: 'Dashboard Barber' }} />
      ) : (
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mon profil' }} />
      )}
    </Stack.Navigator>
  );
};
