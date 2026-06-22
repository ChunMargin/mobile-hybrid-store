import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

// Document ID default untuk pengujian backward-compatibility
export const PRODUCT_DOC_ID = 'LP8evPugCjdfACQOnNYR'; 

/**
 * Meminjam produk (mengurangi stok di Firestore)
 * @param {string} productId - ID dokumen produk di Firestore
 * @param {number} currentStock - Stok saat ini
 * @param {number} quantityToBorrow - Jumlah yang dipinjam (default 1)
 */
export const checkoutProduct = async (productId, currentStock, quantityToBorrow = 1) => {
  const targetId = productId || PRODUCT_DOC_ID;
  if (currentStock < quantityToBorrow) {
    throw new Error('Stok alat tidak mencukupi untuk dipinjam!');
  }
  
  const productRef = doc(db, 'inventory', targetId);
  await updateDoc(productRef, {
    stock: currentStock - quantityToBorrow
  });
};

/**
 * Memperbarui stok produk secara langsung (digunakan oleh Admin)
 * @param {string} productId - ID dokumen produk
 * @param {number} newStock - Nilai stok baru
 */
export const updateProductStock = async (productId, newStock) => {
  if (newStock < 0) {
    throw new Error('Stok tidak boleh kurang dari 0!');
  }
  const productRef = doc(db, 'inventory', productId);
  await updateDoc(productRef, {
    stock: newStock
  });
};

/**
 * Melakukan seeding / reset daftar produk ke Firestore
 * Menggunakan data dari API eksternal dan menetapkan stok awal
 * @param {Array} products - Daftar produk yang didapat dari API
 */
export const seedProductsToFirestore = async (products) => {
  if (!products || !Array.isArray(products)) {
    throw new Error('Data produk untuk seeding tidak valid');
  }

  const batch = writeBatch(db);

  products.forEach((product) => {
    const productRef = doc(db, 'inventory', product.id);
    batch.set(productRef, {
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.defaultStock,
      defaultStock: product.defaultStock
    }, { merge: true });
  });

  await batch.commit();
  console.log('[Firestore] Database berhasil di-seed/reset dengan data eksternal.');
};