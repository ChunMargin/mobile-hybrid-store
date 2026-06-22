import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { auth } from '../services/firebase';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Mahasiswa' | 'Admin Lab'>('Mahasiswa');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  // Fungsi untuk Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Peringatan', 'Email dan password tidak boleh kosong!');
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      Alert.alert('Login Sukses', `Selamat datang, ${userCredential.user.email}!\nMasuk sebagai: ${role}`);
      
      // Pindah halaman dengan parameter role
      router.replace({
        pathname: '/catalog',
        params: { role }
      }); 
      
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Login Gagal', error.message);
    }
  };

  // Fungsi untuk Daftar Akun Baru
  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Peringatan', 'Email dan password tidak boleh kosong!');
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      Alert.alert('Daftar Sukses', `Akun ${userCredential.user.email} berhasil dibuat!\nRole: ${role}`);
      
      // Pindah halaman dengan parameter role
      router.replace({
        pathname: '/catalog',
        params: { role }
      }); 
      
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Daftar Gagal', error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>LAB</Text>
            </View>
            <Text style={styles.title}>Inventaris Lab</Text>
            <Text style={styles.subtitle}>Sistem Sinkronisasi Alat Praktikum Real-Time</Text>
          </View>

          <Text style={styles.label}>Pilih Peran Akses:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'Mahasiswa' && styles.roleButtonActive]} 
              onPress={() => setRole('Mahasiswa')}
              disabled={isLoading}
            >
              <Text style={[styles.roleText, role === 'Mahasiswa' && styles.roleTextActive]}>Mahasiswa</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'Admin Lab' && styles.roleButtonActive]} 
              onPress={() => setRole('Admin Lab')}
              disabled={isLoading}
            >
              <Text style={[styles.roleText, role === 'Admin Lab' && styles.roleTextActive]}>Admin Lab</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Alamat Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nama@kampus.ac.id"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />

            {isLoading ? (
              <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 16 }} />
            ) : (
              <>
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Masuk Ke Sistem</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                  <Text style={styles.registerButtonText}>Daftar Akun Baru</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0F172A' // Premium Dark Slate
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20 
  },
  card: {
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#334155', // Slate 700
  },
  headerContainer: { 
    alignItems: 'center', 
    marginBottom: 32 
  },
  logoBadge: {
    backgroundColor: '#3B82F6', // Blue Accent
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#F8FAFC', // Slate 50
    marginBottom: 6 
  },
  subtitle: { 
    fontSize: 13, 
    color: '#94A3B8', // Slate 400
    textAlign: 'center',
    lineHeight: 18,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#94A3B8', 
    marginBottom: 8 
  },
  roleContainer: { 
    flexDirection: 'row', 
    marginBottom: 24, 
    backgroundColor: '#0F172A', 
    borderRadius: 10, 
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleButton: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 8 
  },
  roleButtonActive: { 
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  roleText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#64748B' 
  },
  roleTextActive: { 
    color: '#FFFFFF' 
  },
  formContainer: { 
    width: '100%' 
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: { 
    backgroundColor: '#0F172A', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 8, 
    fontSize: 15, 
    color: '#F8FAFC', 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  loginButton: { 
    backgroundColor: '#3B82F6', 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  loginButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  registerButton: { 
    backgroundColor: 'transparent', 
    borderWidth: 1, 
    borderColor: '#334155', 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: 'center',
    marginTop: 12 
  },
  registerButtonText: { 
    color: '#94A3B8',
    fontSize: 16, 
    fontWeight: '600',
  },
});

export default LoginScreen;