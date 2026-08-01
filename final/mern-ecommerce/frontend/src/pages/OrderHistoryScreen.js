import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../features/orders/orderSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const OrderHistoryScreen = () => {
  const dispatch = useDispatch();
  const { myOrders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <h1 style={{ marginBottom: 24, fontSize: '1.8rem' }}>Order History</h1>

      {loading ? (
        <Loader fullPage />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : myOrders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Your past orders will show up here once you place one.</p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        myOrders.map((order) => (
          <Link
            to={`/order/${order._id}`}
            className="order-card"
            key={order._id}
            style={{ display: 'block' }}
          >
            <div className="order-card-header">
              <div>
                <div className="order-id">Order #{order._id}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className={`status-badge ${order.status}`}>{order.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
              <span>{order.orderItems.length} item(s)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink)' }}>
                ${order.totalPrice.toFixed(2)}
              </span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

export default OrderHistoryScreen;
