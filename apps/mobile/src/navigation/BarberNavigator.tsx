import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { BarberDashboardScreen } from '../screens/barber/BarberDashboardScreen';

const Stack = createNativeStackNavigator();

export const BarberNavigator: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="BarberDashboard" component={BarberDashboardScreen} options={{ title: 'Dashboard barber' }} />
  </Stack.Navigator>
);
