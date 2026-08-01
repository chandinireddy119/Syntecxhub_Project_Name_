import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaChartPie, FaBoxOpen, FaClipboardList, FaUsers } from 'react-icons/fa';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Admin Panel</div>
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <FaChartPie /> Dashboard
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <FaBoxOpen /> Products
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <FaClipboardList /> Orders
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
        >
          <FaUsers /> Users
        </NavLink>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
