import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../services/firebase';
import { checkoutProduct, PRODUCT_DOC_ID } from '../services/firestore';

const CatalogScreen = () => {
  // State untuk menyimpan angka stok secara real-time
  const [realtimeStock, setRealtimeStock] = useState<number>(0);

  // Hook useEffect ini bertindak sebagai "Listener" yang terus memantau Firebase
  useEffect(() => {
    const productRef = doc(db, 'inventory', PRODUCT_DOC_ID);
    
    const unsubscribe = onSnapshot(productRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRealtimeStock(data.stock); // Update state lokal dengan data dari server
      } else {
        console.log("Dokumen tidak ditemukan!");
      }
    });

    // Membersihkan listener saat pindah halaman agar memori tidak bocor
    return () => unsubscribe();
  }, []);

  // Fungsi yang dipanggil saat tombol pinjam ditekan
  const handleBorrow = async () => {
    try {
      await checkoutProduct(realtimeStock, 1); // Meminjam 1 item
      Alert.alert('Sukses', 'Peminjaman berhasil, stok telah dipotong!');
    } catch (error: any) {
      Alert.alert('Gagal', error.message);
    }
  };

  // Kita gunakan satu dummy product dulu untuk mendemonstrasikan sinkronisasi stoknya
  const DUMMY_PRODUCTS = [
    { id: '1', title: 'Mikrokontroler ESP32 (Sync Test)', price: 45000 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Katalog Produk</Text>
        <Text style={styles.subtitle}>Sinkronisasi Stok Real-time Aktif</Text>
      </View>

      <FlatList
        data={DUMMY_PRODUCTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
              <Text style={styles.productStock}>Stok Live: {realtimeStock}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.buyButton, realtimeStock === 0 && styles.buyButtonDisabled]} 
              onPress={handleBorrow}
              disabled={realtimeStock === 0}
            >
              <Text style={styles.buyButtonText}>
                {realtimeStock === 0 ? 'Habis' : 'Pinjam'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 24, backgroundColor: '#1E293B', paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#34D399', marginTop: 4 }, // Warna hijau tanda aktif
  listContainer: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardInfo: { flex: 1 },
  productTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  productPrice: { fontSize: 14, color: '#3B82F6', marginTop: 4, fontWeight: '600' },
  productStock: { fontSize: 14, color: '#EF4444', marginTop: 4, fontWeight: 'bold' },
  buyButton: { backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  buyButtonDisabled: { backgroundColor: '#94A3B8' },
  buyButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
});

export default CatalogScreen;