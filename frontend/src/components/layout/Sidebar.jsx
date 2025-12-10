import { NavLink } from 'react-router-dom';
import { FiHome, FiShoppingBag, FiUsers, FiShoppingCart, FiBarChart2 } from 'react-icons/fi';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/products', icon: FiShoppingBag, label: 'Sản phẩm' },
    { path: '/customers', icon: FiUsers, label: 'Khách hàng' },
    { path: '/orders', icon: FiShoppingCart, label: 'Đơn hàng' },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <div className="flex items-center space-x-2">
          <FiBarChart2 className="text-3xl text-primary-400" />
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
        <p className="text-gray-400 text-sm mt-1">Phân tích bán hàng</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="text-xl" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <div className="text-xs text-gray-500 px-4">
          <p>© 2024 Analytics</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
