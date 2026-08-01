import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

import HomeScreen from './pages/HomeScreen';
import ShopScreen from './pages/ShopScreen';
import ProductScreen from './pages/ProductScreen';
import CartScreen from './pages/CartScreen';
import WishlistScreen from './pages/WishlistScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import ShippingScreen from './pages/ShippingScreen';
import PaymentScreen from './pages/PaymentScreen';
import PlaceOrderScreen from './pages/PlaceOrderScreen';
import OrderScreen from './pages/OrderScreen';
import OrderHistoryScreen from './pages/OrderHistoryScreen';
import ProfileScreen from './pages/ProfileScreen';

import DashboardScreen from './pages/admin/DashboardScreen';
import ProductListScreen from './pages/admin/ProductListScreen';
import ProductEditScreen from './pages/admin/ProductEditScreen';
import OrderListScreen from './pages/admin/OrderListScreen';
import UserListScreen from './pages/admin/UserListScreen';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/shop" element={<ShopScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/wishlist" element={<WishlistScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/shipping" element={<ShippingScreen />} />
              <Route path="/payment" element={<PaymentScreen />} />
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
              <Route path="/order/:id" element={<OrderScreen />} />
              <Route path="/orders" element={<OrderHistoryScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<DashboardScreen />} />
                <Route path="products" element={<ProductListScreen />} />
                <Route path="products/new" element={<ProductEditScreen />} />
                <Route path="products/:id/edit" element={<ProductEditScreen />} />
                <Route path="orders" element={<OrderListScreen />} />
                <Route path="users" element={<UserListScreen />} />
              </Route>
            </Route>

            <Route
              path="*"
              element={
                <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
                  <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>404</h1>
                  <p style={{ color: 'var(--ink-soft)' }}>Page not found.</p>
                </div>
              }
            />
          </Routes>
        </main>

        <Footer />

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </div>
    </BrowserRouter>
  );
}

export default App;
