# Analytics - Hệ thống Phân tích Dữ liệu Bán hàng

Hệ thống phân tích dữ liệu bán hàng cho cửa hàng trực tuyến với đầy đủ tính năng dashboard và báo cáo.

## 🚀 Tính năng

### Dashboard
- 📊 Tổng quan KPIs (Doanh số, Đơn hàng, AOV, Khách hàng mới)
- 📈 Biểu đồ doanh thu theo thời gian (ngày/tuần/tháng)
- 🥧 Phân tích doanh thu theo danh mục sản phẩm
- 🏆 Top 10 sản phẩm bán chạy nhất

### Quản lý Sản phẩm
- Danh sách sản phẩm với phân trang
- Tìm kiếm sản phẩm
- Hiển thị thông tin chi tiết (giá, tồn kho, đã bán)
- Cảnh báo sản phẩm tồn kho thấp

### Quản lý Khách hàng
- Danh sách khách hàng với phân trang
- Tìm kiếm khách hàng
- Thống kê số đơn hàng và tổng chi tiêu

### Quản lý Đơn hàng
- Danh sách đơn hàng với phân trang
- Lọc theo trạng thái (Đang xử lý, Hoàn thành, Đã hủy)
- Tìm kiếm theo tên khách hàng

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **PostgreSQL** - Database
- **pg** - PostgreSQL client

### Frontend
- **React.js** - UI Library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Chart.js** + **React-Chartjs-2** - Data visualization
- **React Router** - Routing
- **Axios** - HTTP client

### DevOps
- **Docker** + **Docker Compose** - PostgreSQL và pgAdmin

## 📋 Yêu cầu hệ thống

- Node.js 16+ và npm
- Docker và Docker Compose (để chạy PostgreSQL)
- Hoặc PostgreSQL 15+ đã cài đặt sẵn

## 🔧 Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd Analytics
```

### 2. Cài đặt Database với Docker

Khởi động PostgreSQL và pgAdmin:

```bash
docker-compose up -d
```

Kiểm tra container đang chạy:

```bash
docker-compose ps
```

**Thông tin kết nối:**
- PostgreSQL: `localhost:5432`
- Username: `postgres`
- Password: `postgres`
- Database: `analytics_db`
- pgAdmin: `http://localhost:5050`
  - Email: `admin@analytics.com`
  - Password: `admin`

### 3. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa `.env` nếu cần (mặc định đã được cấu hình sẵn).

Chạy migration để tạo tables:

```bash
npm run migrate
```

Seed dữ liệu mẫu (100 sản phẩm, 500 khách hàng, 1000 đơn hàng):

```bash
npm run seed
```

Khởi động backend server:

```bash
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

### 4. Cài đặt Frontend

Mở terminal mới:

```bash
cd frontend
npm install
```

Khởi động frontend:

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 📁 Cấu trúc thư mục

```
Analytics/
├── backend/
│   ├── src/
│   │   ├── config/           # Cấu hình database
│   │   ├── controllers/      # Controllers xử lý request
│   │   ├── models/           # Models (nếu cần)
│   │   ├── routes/           # Định nghĩa routes
│   │   ├── services/         # Business logic
│   │   └── index.js          # Entry point
│   ├── database/
│   │   ├── migrations/       # Database migrations
│   │   └── seeds/            # Seed data
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── charts/       # Biểu đồ
│   │   │   ├── cards/        # KPI cards
│   │   │   └── layout/       # Layout components
│   │   ├── pages/            # Pages
│   │   ├── services/         # API services
│   │   ├── utils/            # Utilities
│   │   ├── App.jsx           # Main app
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Dashboard
- `GET /api/dashboard/overview` - Tổng quan KPIs
- `GET /api/dashboard/revenue?period=day&days=30` - Doanh thu theo thời gian
- `GET /api/dashboard/revenue/category` - Doanh thu theo danh mục
- `GET /api/dashboard/products/top?limit=10` - Top sản phẩm bán chạy
- `GET /api/dashboard/products/low-stock?threshold=20` - Sản phẩm tồn kho thấp
- `GET /api/dashboard/customers` - Phân tích khách hàng
- `GET /api/dashboard/orders` - Phân tích đơn hàng

### Products
- `GET /api/products?page=1&limit=20&search=` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm

### Customers
- `GET /api/customers?page=1&limit=20&search=` - Danh sách khách hàng
- `GET /api/customers/:id` - Chi tiết khách hàng

### Orders
- `GET /api/orders?page=1&limit=20&status=&search=` - Danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng

## 📊 Database Schema

```sql
-- Danh mục sản phẩm
categories (id, name, description, created_at)

-- Sản phẩm
products (id, name, category_id, price, stock, created_at)

-- Khách hàng
customers (id, name, email, phone, address, created_at)

-- Đơn hàng
orders (id, customer_id, total_amount, status, created_at, updated_at)

-- Chi tiết đơn hàng
order_items (id, order_id, product_id, quantity, price, created_at)
```

## 🎨 Tính năng giao diện

- ✅ Responsive design (tương thích mobile, tablet, desktop)
- ✅ Sidebar navigation
- ✅ KPI cards với trend indicators
- ✅ Biểu đồ doanh thu (Line Chart)
- ✅ Biểu đồ danh mục (Doughnut Chart)
- ✅ Bảng dữ liệu với phân trang
- ✅ Tìm kiếm và lọc dữ liệu
- ✅ Vietnamese formatting (ngày tháng, số tiền VNĐ)

## 🚦 Chạy ứng dụng

Sau khi cài đặt xong:

1. Đảm bảo PostgreSQL đang chạy (qua Docker hoặc local)
2. Terminal 1: `cd backend && npm run dev`
3. Terminal 2: `cd frontend && npm run dev`
4. Mở browser: `http://localhost:3000`

## 🔄 Reset dữ liệu

Để reset và seed lại dữ liệu mới:

```bash
cd backend
npm run seed
```

Script sẽ tự động xóa dữ liệu cũ và tạo dữ liệu mới.

## 🛑 Dừng ứng dụng

Dừng servers:
- Nhấn `Ctrl + C` ở cả 2 terminal (backend và frontend)

Dừng Docker containers:

```bash
docker-compose down
```

## 📝 Scripts có sẵn

### Backend
- `npm start` - Chạy server production
- `npm run dev` - Chạy server development với nodemon
- `npm run migrate` - Chạy database migrations
- `npm run seed` - Seed dữ liệu mẫu

### Frontend
- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### Lỗi kết nối database
- Kiểm tra PostgreSQL đang chạy: `docker-compose ps`
- Kiểm tra thông tin kết nối trong file `.env`
- Restart containers: `docker-compose restart`

### Port đã được sử dụng
- Backend (5000): Thay đổi `PORT` trong `.env`
- Frontend (3000): Thay đổi port trong `vite.config.js`
- PostgreSQL (5432): Thay đổi mapping trong `docker-compose.yml`

### Lỗi khi seed data
- Đảm bảo đã chạy migration trước: `npm run migrate`
- Kiểm tra kết nối database
- Xem logs chi tiết trong console

## 📧 Liên hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trong repository.

## 📄 License

MIT License