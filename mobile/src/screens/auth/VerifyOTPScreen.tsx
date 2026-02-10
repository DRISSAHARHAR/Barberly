import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { resendOTP, verifyOTP } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../store';

type Props = {
  route: { params: { userId: string } };
  navigation: any;
};

export const VerifyOTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, index: number) => {
    let value = text;
    if (value.length > 1) value = value[0];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) inputs.current[index + 1]?.focus();
    if (index === 5 && value) handleVerify(newCode.join(''));
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode: string) => {
    if (fullCode.length !== 6) return;
    const result = await dispatch(verifyOTP({ userId, code: fullCode }));

    if (verifyOTP.fulfilled.match(result)) {
      Alert.alert('Succès', 'Votre compte est vérifié ! Veuillez vous connecter.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    const result = await dispatch(resendOTP(userId));
    if (resendOTP.fulfilled.match(result)) {
      setTimer(60);
      Alert.alert('Succès', 'Nouveau code envoyé');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vérification</Text>
      <Text style={styles.subtitle}>Entrez le code à 6 chiffres envoyé à votre téléphone</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.codeInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>

      <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={() => handleVerify(code.join(''))} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Vérification...' : 'Vérifier'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendButton} onPress={handleResend} disabled={timer > 0}>
        <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>{timer > 0 ? `Renvoyer dans ${timer}s` : 'Renvoyer le code'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#1a1a1a' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  codeContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 30 },
  codeInput: { width: 50, height: 60, borderWidth: 2, borderColor: '#e0e0e0', borderRadius: 12, textAlign: 'center', fontSize: 24, fontWeight: 'bold' },
  button: { backgroundColor: '#2c3e50', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resendButton: { marginTop: 20, alignItems: 'center' },
  resendText: { color: '#2c3e50', fontSize: 14, fontWeight: '600' },
  resendDisabled: { color: '#999' }
});
