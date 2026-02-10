import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { userApi } from '../../api/user.api';
import { logout } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../store';

export const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    void loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userApi.getProfile();
      setProfile(response.data);
      setEditData(response.data.profile || {});
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    try {
      await userApi.updateProfile(editData);
      setIsEditing(false);
      await loadProfile();
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (_error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5
    });

    if (!result.canceled) {
      setEditData({ ...editData, avatar: result.assets[0].uri });
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => dispatch(logout()) }
    ]);
  };

  if (!profile) return <Text>Chargement...</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
          <Image source={{ uri: editData.avatar || profile.profile?.avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
          {isEditing && (
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>📷</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{profile.profile?.firstName} {profile.profile?.lastName}</Text>
        <Text style={styles.role}>{profile.role === 'CLIENT' ? 'Client' : 'Coiffeur'}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <TouchableOpacity onPress={() => (isEditing ? void handleUpdate() : setIsEditing(true))}>
            <Text style={styles.editButton}>{isEditing ? '💾 Sauvegarder' : '✏️ Modifier'}</Text>
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <>
            <TextInput style={styles.input} placeholder="Prénom" value={editData.firstName} onChangeText={(text) => setEditData({ ...editData, firstName: text })} />
            <TextInput style={styles.input} placeholder="Nom" value={editData.lastName} onChangeText={(text) => setEditData({ ...editData, lastName: text })} />
            <TextInput style={styles.input} placeholder="Adresse" value={editData.address} onChangeText={(text) => setEditData({ ...editData, address: text })} />
            <TextInput style={styles.input} placeholder="Ville" value={editData.city} onChangeText={(text) => setEditData({ ...editData, city: text })} />
          </>
        ) : (
          <>
            <InfoRow label="Téléphone" value={profile.phone} />
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Adresse" value={profile.profile?.address || 'Non renseignée'} />
            <InfoRow label="Ville" value={profile.profile?.city || 'Non renseignée'} />
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#2c3e50', padding: 30, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  editBadgeText: { fontSize: 16 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  role: { fontSize: 14, color: '#bdc3c7', marginTop: 5 },
  section: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  editButton: { color: '#2c3e50', fontWeight: '600' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { color: '#666', fontSize: 14 },
  value: { color: '#1a1a1a', fontSize: 14, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 14 },
  logoutButton: { margin: 15, backgroundColor: '#e74c3c', padding: 15, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
