import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState, useMemo } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { db } from '../services/firebase';
import { checkoutProduct, updateProductStock, seedProductsToFirestore } from '../services/firestore';
import { fetchCatalog, Product } from '../services/api';

const CatalogScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Deteksi peran user (Mahasiswa atau Admin Lab)
  const role = (params.role as 'Mahasiswa' | 'Admin Lab') || 'Mahasiswa';

  // State untuk katalog spesifikasi dari API eksternal
  const [catalog, setCatalog] = useState<Product[]>([]);
  // State untuk stok real-time dari Firestore
  const [liveStocks, setLiveStocks] = useState<Record<string, number>>({});
  
  // State Loading & Refreshing
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // State Pencarian & Kategori
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Kategori yang tersedia
  const categories = ['Semua', 'Mikrokontroler', 'Sensor', 'Alat Ukur', 'PLC & Otomasi'];

  // Hook useEffect 1: Load Data Awal via Axios (API Eksternal)
  useEffect(() => {
    const loadCatalogData = async () => {
      try {
        const fetchedCatalog = await fetchCatalog();
        setCatalog(fetchedCatalog);
      } catch (err) {
        console.error('Gagal memuat katalog:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCatalogData();
  }, []);

  // Hook useEffect 2: Real-time Listener Firestore untuk Stok
  useEffect(() => {
    console.log('[Firestore] Mengaktifkan listener real-time stok...');
    const inventoryRef = collection(db, 'inventory');
    
    const unsubscribe = onSnapshot(inventoryRef, (snapshot) => {
      const stocks: Record<string, number> = {};
      snapshot.forEach((docSnap) => {
        stocks[docSnap.id] = docSnap.data().stock ?? 0;
      });
      console.log('[Firestore] Sinkronisasi stok diterima:', stocks);
      setLiveStocks(stocks);
    }, (error) => {
      console.error('[Firestore] Gagal mendengarkan stok:', error);
    });

    // Cleanup listener pada unmount
    return () => unsubscribe();
  }, []);

  // Fungsi Peminjaman (Mahasiswa)
  const handleBorrow = async (productId: string, currentStock: number) => {
    setIsActionLoading(true);
    try {
      await checkoutProduct(productId, currentStock, 1);
      Alert.alert('Peminjaman Berhasil', 'Silakan ambil alat di ruang laboran.');
    } catch (error: any) {
      Alert.alert('Gagal Meminjam', error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Fungsi Update Stok (Admin: Tambah)
  const handleIncrementStock = async (productId: string, currentStock: number) => {
    try {
      await updateProductStock(productId, currentStock + 1);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // Fungsi Update Stok (Admin: Kurang)
  const handleDecrementStock = async (productId: string, currentStock: number) => {
    if (currentStock <= 0) {
      Alert.alert('Peringatan', 'Stok sudah mencapai batas minimal (0).');
      return;
    }
    try {
      await updateProductStock(productId, currentStock - 1);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  // Fungsi Seeding / Reset Database (Admin)
  const handleSeedDatabase = () => {
    Alert.alert(
      'Konfirmasi Reset',
      'Apakah Anda yakin ingin menyinkronkan ulang database Firestore dengan data default dari API eksternal?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Ya, Sinkronkan', 
          onPress: async () => {
            setIsActionLoading(true);
            try {
              // 1. Ambil data spesifikasi segar dari API via Axios
              const freshCatalog = await fetchCatalog();
              setCatalog(freshCatalog);
              
              // 2. Tulis batch stok bawaan ke Firestore
              await seedProductsToFirestore(freshCatalog);
              Alert.alert('Sukses', 'Database Firestore berhasil disinkronkan & di-reset dengan data API.');
            } catch (error: any) {
              Alert.alert('Gagal Seeding', error.message);
            } finally {
              setIsActionLoading(false);
            }
          }
        }
      ]
    );
  };

  // Logout & Kembali ke Halaman Login
  const handleLogout = () => {
    router.replace('/');
  };

  // Filter & Pencarian Produk
  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'Semua' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [catalog, searchQuery, selectedCategory]);

  // Fungsi penentu warna stok live
  const getStockColor = (stock: number) => {
    if (stock > 5) return '#10B981'; // Hijau (Aman)
    if (stock > 0) return '#F59E0B'; // Oranye (Menipis)
    return '#EF4444'; // Merah (Habis)
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Memuat spesifikasi dari API eksternal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Action Loader Overlay */}
      {isActionLoading && (
        <View style={styles.actionLoaderOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.actionLoaderText}>Memproses transaksi...</Text>
        </View>
      )}

      {/* Header Premium */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Katalog Alat</Text>
            <Text style={styles.roleBadge}>{role === 'Admin Lab' ? 'Mode Pengelola Lab' : 'Mode Peminjam'}</Text>
          </View>
          
          <View style={styles.headerActions}>
            {role === 'Admin Lab' && (
              <TouchableOpacity style={styles.seedButton} onPress={handleSeedDatabase}>
                <Text style={styles.seedButtonText}>Reset DB</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Keluar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>Sinkronisasi Inventaris Real-Time Aktif</Text>
      </View>

      {/* Kontrol Pencarian & Kategori */}
      <View style={styles.searchFilterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari alat atau sensor..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List Katalog */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada alat lab yang cocok dengan kriteria.</Text>
            {role === 'Admin Lab' && catalog.length === 0 && (
              <TouchableOpacity style={styles.emptySeedButton} onPress={handleSeedDatabase}>
                <Text style={styles.emptySeedButtonText}>Klik untuk Inisialisasi Database</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => {
          // Stok real-time diambil dari liveStocks berdasarkan ID produk.
          // Jika belum disinkronisasikan ke Firestore, tampilkan stok default dari API.
          const isStockInFirestore = liveStocks.hasOwnProperty(item.id);
          const stock = isStockInFirestore ? liveStocks[item.id] : item.defaultStock;
          const stockColor = getStockColor(stock);

          return (
            <View style={styles.card}>
              <Image 
                source={{ uri: item.imageUrl }}
                style={styles.productImage}
                contentFit="cover"
                transition={500}
              />
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{item.category}</Text>
                  </View>
                  {!isStockInFirestore && (
                    <View style={styles.syncWarningTag}>
                      <Text style={styles.syncWarningText}>Not Synced</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.priceLabel}>Biaya Jaminan</Text>
                    <Text style={styles.productPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
                  </View>

                  <View style={styles.stockStatusContainer}>
                    <Text style={styles.stockLabel}>Stok Live</Text>
                    <Text style={[styles.stockValue, { color: stockColor }]}>
                      {stock} {stock === 0 ? '(Habis)' : 'unit'}
                    </Text>
                  </View>
                </View>

                {/* Kontrol berdasarkan Peran Akses */}
                <View style={styles.controlsContainer}>
                  {role === 'Admin Lab' ? (
                    <View style={styles.adminControls}>
                      <Text style={styles.adminControlsLabel}>Atur Stok:</Text>
                      <View style={styles.stockAdjuster}>
                        <TouchableOpacity 
                          style={styles.adjustButton} 
                          onPress={() => handleDecrementStock(item.id, stock)}
                        >
                          <Text style={styles.adjustButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.adjustValue}>{stock}</Text>
                        <TouchableOpacity 
                          style={styles.adjustButton} 
                          onPress={() => handleIncrementStock(item.id, stock)}
                        >
                          <Text style={styles.adjustButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[
                        styles.borrowButton, 
                        stock === 0 && styles.borrowButtonDisabled
                      ]} 
                      onPress={() => handleBorrow(item.id, stock)}
                      disabled={stock === 0}
                    >
                      <Text style={styles.borrowButtonText}>
                        {stock === 0 ? 'Stok Kosong' : 'Ajukan Pinjam'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0F172A' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#0F172A',
    padding: 24 
  },
  loadingText: { 
    color: '#94A3B8', 
    marginTop: 16, 
    fontSize: 15,
    textAlign: 'center'
  },
  actionLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
  actionLoaderText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold'
  },
  header: { 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    backgroundColor: '#1E293B', 
    paddingTop: 50,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#F8FAFC' 
  },
  roleBadge: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seedButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  seedButtonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 12,
  },
  subtitle: { 
    fontSize: 13, 
    color: '#10B981', 
    marginTop: 8,
    fontWeight: '500'
  },
  searchFilterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0F172A',
    gap: 12,
  },
  searchInput: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 15,
  },
  categoriesScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: { 
    padding: 16,
    paddingBottom: 40 
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
    textAlign: 'center',
  },
  emptySeedButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  emptySeedButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: { 
    backgroundColor: '#1E293B', 
    borderRadius: 14, 
    marginBottom: 16, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#0F172A',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  syncWarningTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  syncWarningText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#F8FAFC',
    marginBottom: 6,
  },
  productDescription: { 
    fontSize: 13, 
    color: '#94A3B8', 
    lineHeight: 18,
    marginBottom: 16,
  },
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 14,
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  productPrice: { 
    fontSize: 15, 
    color: '#3B82F6', 
    fontWeight: 'bold' 
  },
  stockStatusContainer: {
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  stockValue: { 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  controlsContainer: {
    width: '100%',
  },
  borrowButton: { 
    backgroundColor: '#3B82F6', 
    paddingVertical: 12, 
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  borrowButtonDisabled: { 
    backgroundColor: '#475569',
  },
  borrowButtonText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold',
    fontSize: 14,
  },
  adminControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  adminControlsLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  stockAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustButton: {
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adjustValue: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
});

export default CatalogScreen;