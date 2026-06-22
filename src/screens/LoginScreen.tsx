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
} from 'react-native';
import { auth } from '../services/firebase';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Mahasiswa' | 'Admin Lab'>('Mahasiswa');
  
  // 1. Inisialisasi router di sini
  const router = useRouter();

  // Fungsi untuk Login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Peringatan', 'Email dan password tidak boleh kosong!');
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Login Sukses', `Selamat datang, ${userCredential.user.email}!\nMasuk sebagai: ${role}`);
      
      // 2. Perintah pindah halaman setelah login sukses
      router.replace('/catalog'); 
      
    } catch (error: any) {
      Alert.alert('Login Gagal', error.message);
    }
  };

  // Fungsi untuk Daftar Akun Baru
  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Peringatan', 'Email dan password tidak boleh kosong!');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Daftar Sukses', `Akun ${userCredential.user.email} berhasil dibuat!\nRole: ${role}`);
      
      // 3. Perintah pindah halaman setelah daftar sukses
      router.replace('/catalog'); 
      
    } catch (error: any) {
      Alert.alert('Daftar Gagal', error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Peminjaman Alat Lab</Text>
          <Text style={styles.subtitle}>Sistem Sinkronisasi Inventaris Alat Praktikum Lab</Text>
        </View>

        <Text style={styles.label}>Masuk Sebagai:</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity style={[styles.roleButton, role === 'Mahasiswa' && styles.roleButtonActive]} onPress={() => setRole('Mahasiswa')}>
            <Text style={[styles.roleText, role === 'Mahasiswa' && styles.roleTextActive]}>Mahasiswa (Peminjam)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleButton, role === 'Admin Lab' && styles.roleButtonActive]} onPress={() => setRole('Admin Lab')}>
            <Text style={[styles.roleText, role === 'Admin Lab' && styles.roleTextActive]}>Admin Lab (Pengelola)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Alamat Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Masuk</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.loginButton, styles.registerButton]} onPress={handleRegister}>
            <Text style={[styles.loginButtonText, styles.registerButtonText]}>Daftar Akun Baru</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  roleContainer: { flexDirection: 'row', marginBottom: 24, backgroundColor: '#E2E8F0', borderRadius: 8, padding: 4 },
  roleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 6 },
  roleButtonActive: { backgroundColor: '#3B82F6' },
  roleText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  roleTextActive: { color: '#FFFFFF' },
  formContainer: { width: '100%' },
  input: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 8, fontSize: 15, color: '#1E293B', marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  loginButton: { backgroundColor: '#1E293B', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  registerButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#1E293B', marginTop: 12 },
  registerButtonText: { color: '#1E293B' },
});

export default LoginScreen;