import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchOrderDetails, payOrder } from '../features/orders/orderSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

const OrderScreen = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [dispatch, id]);

  const handleMockPay = () => {
    dispatch(payOrder(id)).then((res) => {
      if (!res.error) toast.success('Payment confirmed');
    });
  };

  if (loading || !order) return <Loader fullPage />;
  if (error) {
    return (
      <div className="container">
        <Message variant="danger">{error}</Message>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="container" style={{ maxWidth: 900, paddingTop: 24, paddingBottom: 48 }}>
      <div className="breadcrumbs">
        <Link to="/orders">Order History</Link>
        <span className="sep">/</span>
        <span>Order #{order._id}</span>
      </div>

      <div className="order-card">
        <div className="order-card-header">
          <div>
            <div className="order-id">Order #{order._id}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
          <span className={`status-badge ${order.status}`}>{order.status}</span>
        </div>

        {order.status !== 'cancelled' && (
          <div className="checkout-steps" style={{ margin: '24px 0' }}>
            {statusSteps.map((step, idx) => (
              <React.Fragment key={step}>
                <div className={`checkout-step ${idx <= currentStepIndex ? 'done' : ''} ${idx === currentStepIndex ? 'active' : ''}`}>
                  <span className="checkout-step-num">{idx + 1}</span>
                  <span style={{ textTransform: 'capitalize' }}>{step}</span>
                </div>
                {idx < statusSteps.length - 1 && <div className="checkout-step-divider" />}
              </React.Fragment>
            ))}
          </div>
        )}

        <h3 style={{ margin: '20px 0 12px', fontSize: '1rem' }}>Shipping Address</h3>
        <p style={{ color: 'var(--ink-soft)' }}>
          {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
          {order.shippingAddress.postalCode}, {order.shippingAddress.country}
        </p>

        <h3 style={{ margin: '20px 0 12px', fontSize: '1rem' }}>Payment</h3>
        <p style={{ color: 'var(--ink-soft)' }}>
          Method: {order.paymentMethod} &middot;{' '}
          {order.isPaid ? (
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>
              Paid on {new Date(order.paidAt).toLocaleDateString()}
            </span>
          ) : (
            <span style={{ color: 'var(--clay)', fontWeight: 600 }}>Not Paid</span>
          )}
        </p>
        {!order.isPaid && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginTop: 12 }}
            onClick={handleMockPay}
          >
            Mark as Paid (Demo)
          </button>
        )}

        <h3 style={{ margin: '24px 0 12px', fontSize: '1rem' }}>Items</h3>
        {order.orderItems.map((item) => (
          <div className="order-row" key={item.product}>
            <img src={item.image} alt={item.name} />
            <div style={{ flex: 1 }}>
              <Link to={`/product/${item.product}`}>{item.name}</Link>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
            </span>
          </div>
        ))}

        <div style={{ marginTop: 24, maxWidth: 320, marginLeft: 'auto' }}>
          <div className="cart-summary-row">
            <span>Items</span>
            <span>${order.itemsPrice.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span>${order.shippingPrice.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Tax</span>
            <span>${order.taxPrice.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;
