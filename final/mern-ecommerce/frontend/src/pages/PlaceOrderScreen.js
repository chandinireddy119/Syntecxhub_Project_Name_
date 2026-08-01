import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createOrder, resetOrderState } from '../features/orders/orderSlice';
import { clearCart } from '../features/cart/cartSlice';
import CheckoutSteps from '../components/CheckoutSteps';
import Loader from '../components/Loader';

const PlaceOrderScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, shippingAddress, paymentMethod } = useSelector((state) => state.cart);
  const { order, loading, error, createSuccess } = useSelector((state) => state.orders);

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 9.99;
  const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  useEffect(() => {
    if (!shippingAddress.address) navigate('/shipping');
    else if (!paymentMethod) navigate('/payment');
  }, [shippingAddress, paymentMethod, navigate]);

  useEffect(() => {
    if (createSuccess && order) {
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate(`/order/${order._id}`);
      dispatch(resetOrderState());
    }
    if (error) {
      toast.error(error);
    }
  }, [createSuccess, order, error, dispatch, navigate]);

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        orderItems: cartItems.map((item) => ({
          product: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.qty,
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      })
    );
  };

  return (
    <div className="container" style={{ maxWidth: 900, paddingTop: 24, paddingBottom: 48 }}>
      <CheckoutSteps step1 step2 step3 step4 />

      <div className="checkout-layout">
        <div>
          <div className="checkout-panel">
            <h3>Shipping</h3>
            <p style={{ color: 'var(--ink-soft)' }}>
              {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode},{' '}
              {shippingAddress.country}
            </p>
          </div>

          <div className="checkout-panel">
            <h3>Payment Method</h3>
            <p style={{ color: 'var(--ink-soft)' }}>{paymentMethod}</p>
          </div>

          <div className="checkout-panel">
            <h3>Order Items</h3>
            {cartItems.map((item) => (
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
          </div>
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Items</span>
            <span>${itemsPrice.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping</span>
            <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span>
          </div>
          <div className="cart-summary-row">
            <span>Tax</span>
            <span>${taxPrice.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 20 }}
            disabled={cartItems.length === 0 || loading}
            onClick={placeOrderHandler}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
          {loading && <Loader />}
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;
