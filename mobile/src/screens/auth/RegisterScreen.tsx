import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clearError, register } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../store';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT' as 'CLIENT' | 'BARBER'
  });

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }

    const phoneRegex = /^(0|\+212)[5-7][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      Alert.alert('Erreur', 'Numéro de téléphone invalide');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    dispatch(clearError());
    const result = await dispatch(
      register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone.replace(/\s/g, ''),
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
    );

    if (register.fulfilled.match(result)) {
      navigation.navigate('VerifyOTP', { userId: result.payload.userId });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Rejoignez Barberly</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.roleSelector}>
        <TouchableOpacity
          style={[styles.roleButton, formData.role === 'CLIENT' && styles.roleButtonActive]}
          onPress={() => setFormData({ ...formData, role: 'CLIENT' })}
        >
          <Text style={formData.role === 'CLIENT' ? styles.roleTextActive : styles.roleText}>Je suis Client</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, formData.role === 'BARBER' && styles.roleButtonActive]}
          onPress={() => setFormData({ ...formData, role: 'BARBER' })}
        >
          <Text style={formData.role === 'BARBER' ? styles.roleTextActive : styles.roleText}>Je suis Coiffeur</Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Prénom" value={formData.firstName} onChangeText={(text) => setFormData({ ...formData, firstName: text })} />
      <TextInput style={styles.input} placeholder="Nom" value={formData.lastName} onChangeText={(text) => setFormData({ ...formData, lastName: text })} />
      <TextInput style={styles.input} placeholder="Téléphone (ex: 0612345678)" keyboardType="phone-pad" value={formData.phone} onChangeText={(text) => setFormData({ ...formData, phone: text })} />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} />
      <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry value={formData.password} onChangeText={(text) => setFormData({ ...formData, password: text })} />
      <TextInput style={styles.input} placeholder="Confirmer le mot de passe" secureTextEntry value={formData.confirmPassword} onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })} />

      <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSubmit} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Chargement...' : "S'inscrire"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  error: { color: '#e74c3c', marginBottom: 15, textAlign: 'center' },
  roleSelector: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  roleButton: { flex: 1, padding: 15, borderRadius: 12, borderWidth: 2, borderColor: '#e0e0e0', alignItems: 'center' },
  roleButtonActive: { borderColor: '#2c3e50', backgroundColor: '#2c3e50' },
  roleText: { color: '#666', fontWeight: '600' },
  roleTextActive: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, padding: 15, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#2c3e50', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#2c3e50', textAlign: 'center', marginTop: 20, fontSize: 14 }
});
