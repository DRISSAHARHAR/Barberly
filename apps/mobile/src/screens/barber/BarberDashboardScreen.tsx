import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const BarberDashboardScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Espace Coiffeur</Text>
      <Text>Gestion des services, disponibilités et portfolio.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 10 }
});
