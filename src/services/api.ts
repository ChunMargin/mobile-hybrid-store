import axios from 'axios';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  price: number;
  defaultStock: number;
}

const CATALOG_API_URL = 'https://jsonblob.com/api/jsonBlob/019eeff9-0625-744c-87ee-c3b102cba4b8';

// Data cadangan jika pemanggilan API gagal (Offline Fallback)
export const LOCAL_FALLBACK_CATALOG: Product[] = [
  {
    id: 'esp32',
    name: 'Mikrokontroler ESP32 DevKitC',
    category: 'Mikrokontroler',
    description: 'ESP32-WROOM-32D development board dengan Wi-Fi & Bluetooth, ideal untuk projek IoT.',
    imageUrl: 'https://images.unsplash.com/photo-1553406830-ef25136798e6?q=80&w=400&auto=format&fit=crop',
    price: 45000,
    defaultStock: 10
  },
  {
    id: 'mpu6050',
    name: 'Sensor MPU6050 Gyroscope',
    category: 'Sensor',
    description: 'Sensor tracking gerakan 6-axis (3-axis gyroscope dan 3-axis accelerometer).',
    imageUrl: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?q=80&w=400&auto=format&fit=crop',
    price: 25000,
    defaultStock: 15
  },
  {
    id: 'multimeter',
    name: 'Digital Multimeter Aneng AN8008',
    category: 'Alat Ukur',
    description: 'Multimeter digital dengan presisi tinggi, auto-ranging, dan layar LCD backlight.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400&auto=format&fit=crop',
    price: 120000,
    defaultStock: 5
  },
  {
    id: 'plc_siemens',
    name: 'Modul PLC Siemens LOGO! 24RCE',
    category: 'PLC & Otomasi',
    description: 'Modul logika industri dengan layar display, port Ethernet, dan output relay.',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=400&auto=format&fit=crop',
    price: 2450000,
    defaultStock: 3
  },
  {
    id: 'arduino_uno',
    name: 'Arduino Uno R3 Starter Kit',
    category: 'Mikrokontroler',
    description: 'Mikrokontroler board berbasis ATmega328P lengkap dengan kabel USB dan aksesoris.',
    imageUrl: 'https://images.unsplash.com/photo-1553406830-ef25136798e6?q=80&w=400&auto=format&fit=crop',
    price: 85000,
    defaultStock: 8
  }
];

/**
 * Mengambil data katalog spesifikasi alat lab dari API Eksternal
 */
export const fetchCatalog = async (): Promise<Product[]> => {
  try {
    console.log(`[API] Menarik katalog dari ${CATALOG_API_URL}...`);
    const response = await axios.get<Product[]>(CATALOG_API_URL, {
      timeout: 8000 // Batas waktu 8 detik
    });
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`[API] Berhasil menarik ${response.data.length} produk dari API eksternal.`);
      return response.data;
    }
    
    throw new Error('Format data API tidak valid');
  } catch (error: any) {
    console.warn('[API] Gagal menarik data dari API eksternal, beralih ke katalog lokal.', error.message);
    return LOCAL_FALLBACK_CATALOG;
  }
};
