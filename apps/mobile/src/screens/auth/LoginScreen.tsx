import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../store';

export const LoginScreen: React.FC<any> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    if (!phone || !password) {
      Alert.alert('Erreur', 'Téléphone et mot de passe requis');
      return;
    }
    await dispatch(login({ phone, password }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput style={styles.input} placeholder="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>{isLoading ? 'Chargement...' : 'Se connecter'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  error: { color: 'red', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, marginBottom: 12 },
  button: { backgroundColor: '#2c3e50', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  link: { marginTop: 14, textAlign: 'center', color: '#2c3e50' }
});
