import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaShoppingBag } from 'react-icons/fa';
import { removeFromCart, updateCartQty } from '../features/cart/cartSlice';

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 9.99;
  const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleCheckout = () => {
    if (!userInfo) {
      navigate('/login?redirect=/shipping');
      return;
    }
    navigate('/shipping');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="cart-empty">
          <FaShoppingBag size={48} color="var(--mist-dark)" />
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ padding: '32px 0 24px', fontSize: '1.8rem' }}>Shopping Cart</h1>
      <div className="cart-page">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={item.product}>
              <img src={item.image} alt={item.name} className="cart-item-img" />
              <div>
                <Link to={`/product/${item.product}`} className="cart-item-name">
                  {item.name}
                </Link>
                <div className="cart-item-meta">${item.price.toFixed(2)} each</div>
              </div>
              <div className="qty-selector">
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      updateCartQty({ productId: item.product, qty: Math.max(1, item.qty - 1) })
                    )
                  }
                >
                  &minus;
                </button>
                <span>{item.qty}</span>
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      updateCartQty({
                        productId: item.product,
                        qty: Math.min(item.countInStock, item.qty + 1),
                      })
                    )
                  }
                >
                  +
                </button>
              </div>
              <span className="cart-item-price">${(item.price * item.qty).toFixed(2)}</span>
              <button
                type="button"
                className="cart-item-remove"
                onClick={() => dispatch(removeFromCart(item.product))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Subtotal ({cartItems.reduce((a, i) => a + i.qty, 0)} items)</span>
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
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;
