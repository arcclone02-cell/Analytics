const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'analytics_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Dữ liệu danh mục sản phẩm
const categories = [
  { name: 'Điện thoại & Phụ kiện', description: 'Điện thoại di động và các phụ kiện liên quan' },
  { name: 'Laptop & Máy tính', description: 'Laptop, PC và phụ kiện máy tính' },
  { name: 'Thiết bị âm thanh', description: 'Tai nghe, loa, micro và thiết bị âm thanh' },
  { name: 'Máy ảnh & Camera', description: 'Máy ảnh kỹ thuật số và camera giám sát' },
  { name: 'Đồng hồ thông minh', description: 'Smartwatch và thiết bị đeo tay' },
  { name: 'Tablet & eReader', description: 'Máy tính bảng và thiết bị đọc sách' },
  { name: 'Thiết bị gia dụng', description: 'Điện máy và thiết bị gia đình' },
  { name: 'Gaming & Console', description: 'Máy chơi game và phụ kiện gaming' },
];

// Dữ liệu sản phẩm mẫu
const productNames = {
  'Điện thoại & Phụ kiện': [
    'iPhone 15 Pro Max', 'Samsung Galaxy S24 Ultra', 'Xiaomi 14 Pro', 'OPPO Find X7',
    'Vivo X100 Pro', 'Realme GT 5 Pro', 'OnePlus 12', 'Google Pixel 8 Pro',
    'Ốp lưng iPhone', 'Cáp sạc Type-C', 'Tai nghe AirPods', 'Sạc nhanh 65W'
  ],
  'Laptop & Máy tính': [
    'MacBook Pro M3', 'Dell XPS 15', 'HP Pavilion', 'Asus ROG Strix',
    'Lenovo ThinkPad', 'Acer Nitro 5', 'MSI Gaming GF63', 'Surface Laptop 5',
    'Chuột Gaming Logitech', 'Bàn phím cơ', 'Webcam 4K', 'USB Hub'
  ],
  'Thiết bị âm thanh': [
    'Sony WH-1000XM5', 'AirPods Pro 2', 'JBL Flip 6', 'Bose QuietComfort',
    'Samsung Galaxy Buds', 'Harman Kardon Onyx', 'Marshall Emberton', 'Beats Studio Pro'
  ],
  'Máy ảnh & Camera': [
    'Canon EOS R6', 'Sony A7 IV', 'Nikon Z6 II', 'Fujifilm X-T5',
    'GoPro Hero 12', 'DJI Action 4', 'Camera giám sát Xiaomi', 'Lens Canon 50mm'
  ],
  'Đồng hồ thông minh': [
    'Apple Watch Series 9', 'Samsung Galaxy Watch 6', 'Xiaomi Watch S3', 'Garmin Fenix 7',
    'Huawei Watch GT 4', 'Amazfit GTR 4', 'Oppo Watch 4 Pro', 'Fitbit Sense 2'
  ],
  'Tablet & eReader': [
    'iPad Pro M2', 'Samsung Tab S9', 'Xiaomi Pad 6', 'Lenovo Tab P11',
    'Kindle Paperwhite', 'Huawei MatePad', 'Surface Pro 9', 'OnePlus Pad'
  ],
  'Thiết bị gia dụng': [
    'Nồi cơm điện Xiaomi', 'Máy lọc không khí', 'Robot hút bụi', 'Máy xay sinh tố',
    'Bếp từ đôi', 'Lò vi sóng', 'Máy giặt mini', 'Quạt điều hòa'
  ],
  'Gaming & Console': [
    'PlayStation 5', 'Xbox Series X', 'Nintendo Switch OLED', 'Steam Deck',
    'Tay cầm PS5', 'Tai nghe gaming', 'Ghế gaming', 'Bàn gaming'
  ]
};

// Tên khách hàng Việt Nam
const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const middleNames = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Anh', 'Tuấn', 'Hoàng', 'Quốc', 'Thanh', 'Phương', 'Thu'];
const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Đạt', 'Giang', 'Hà', 'Hùng', 'Khánh', 'Linh', 'Mai', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tâm', 'Tuấn', 'Vân', 'Yến', 'Hương'];

// Địa chỉ Việt Nam
const cities = ['Hà Nội', 'TP Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Vũng Tàu', 'Huế'];
const districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Đống Đa', 'Hai Bà Trưng', 'Thanh Xuân', 'Cầu Giấy', 'Hoàn Kiếm'];
const streets = ['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lý Thái Tổ', 'Điện Biên Phủ', 'Nguyễn Thị Minh Khai'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCustomerName() {
  return `${getRandomElement(firstNames)} ${getRandomElement(middleNames)} ${getRandomElement(lastNames)}`;
}

function generateAddress() {
  return `${getRandomInt(1, 999)} ${getRandomElement(streets)}, ${getRandomElement(districts)}, ${getRandomElement(cities)}`;
}

function generatePhone() {
  return `09${getRandomInt(10000000, 99999999)}`;
}

function generateEmail(name) {
  const nameSlug = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '.');
  return `${nameSlug}${getRandomInt(1, 999)}@gmail.com`;
}

// Tạo ngày trong khoảng 6 tháng gần nhất
function getRandomDate() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Bắt đầu seed dữ liệu...');
    
    // Xóa dữ liệu cũ
    console.log('🗑️  Xóa dữ liệu cũ...');
    await client.query('TRUNCATE TABLE order_items, orders, customers, products, categories RESTART IDENTITY CASCADE');
    
    // 1. Seed Categories
    console.log('📁 Thêm danh mục sản phẩm...');
    const categoryIds = [];
    for (const category of categories) {
      const result = await client.query(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
        [category.name, category.description]
      );
      categoryIds.push({ id: result.rows[0].id, name: category.name });
    }
    console.log(`✅ Đã thêm ${categoryIds.length} danh mục`);
    
    // 2. Seed Products
    console.log('📦 Thêm sản phẩm...');
    const productIds = [];
    for (const category of categoryIds) {
      const products = productNames[category.name] || [];
      for (const productName of products) {
        const price = getRandomInt(100, 5000) * 10000; // 1-50 triệu VNĐ
        const stock = getRandomInt(0, 200);
        
        const result = await client.query(
          'INSERT INTO products (name, category_id, price, stock, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [productName, category.id, price, stock, getRandomDate()]
        );
        productIds.push(result.rows[0].id);
      }
    }
    
    // Thêm thêm sản phẩm để đủ 100
    while (productIds.length < 100) {
      const category = getRandomElement(categoryIds);
      const baseProduct = getRandomElement(productNames[category.name]);
      const productName = `${baseProduct} ${getRandomElement(['Plus', 'Pro', 'Max', 'Ultra', 'Special Edition'])}`;
      const price = getRandomInt(100, 5000) * 10000;
      const stock = getRandomInt(0, 200);
      
      const result = await client.query(
        'INSERT INTO products (name, category_id, price, stock, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [productName, category.id, price, stock, getRandomDate()]
      );
      productIds.push(result.rows[0].id);
    }
    console.log(`✅ Đã thêm ${productIds.length} sản phẩm`);
    
    // 3. Seed Customers
    console.log('👥 Thêm khách hàng...');
    const customerIds = [];
    for (let i = 0; i < 500; i++) {
      const name = generateCustomerName();
      const email = generateEmail(name);
      const phone = generatePhone();
      const address = generateAddress();
      
      const result = await client.query(
        'INSERT INTO customers (name, email, phone, address, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [name, email, phone, address, getRandomDate()]
      );
      customerIds.push(result.rows[0].id);
    }
    console.log(`✅ Đã thêm ${customerIds.length} khách hàng`);
    
    // 4. Seed Orders
    console.log('🛒 Thêm đơn hàng...');
    const statuses = ['pending', 'completed', 'cancelled', 'completed', 'completed', 'completed']; // Bias towards completed
    
    for (let i = 0; i < 1000; i++) {
      const customerId = getRandomElement(customerIds);
      const status = getRandomElement(statuses);
      const orderDate = getRandomDate();
      
      // Tạo order trước để lấy ID
      const orderResult = await client.query(
        'INSERT INTO orders (customer_id, total_amount, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [customerId, 0, status, orderDate, orderDate]
      );
      const orderId = orderResult.rows[0].id;
      
      // Thêm order items
      const numItems = getRandomInt(1, 5);
      let totalAmount = 0;
      
      for (let j = 0; j < numItems; j++) {
        const productId = getRandomElement(productIds);
        const quantity = getRandomInt(1, 3);
        
        // Lấy giá sản phẩm
        const productResult = await client.query('SELECT price FROM products WHERE id = $1', [productId]);
        const price = parseFloat(productResult.rows[0].price);
        
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [orderId, productId, quantity, price]
        );
        
        totalAmount += price * quantity;
      }
      
      // Cập nhật tổng tiền đơn hàng
      await client.query(
        'UPDATE orders SET total_amount = $1 WHERE id = $2',
        [totalAmount, orderId]
      );
    }
    console.log(`✅ Đã thêm 1000 đơn hàng`);
    
    await client.query('COMMIT');
    console.log('🎉 Seed dữ liệu hoàn thành!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch(console.error);
