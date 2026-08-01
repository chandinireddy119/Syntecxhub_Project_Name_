import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../features/cart/cartSlice';
import CheckoutSteps from '../components/CheckoutSteps';

const PaymentScreen = () => {
  const { shippingAddress, paymentMethod: savedMethod } = useSelector((state) => state.cart);
  const [paymentMethod, setPaymentMethod] = useState(savedMethod || 'Cash On Delivery');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!shippingAddress.address) {
    navigate('/shipping');
  }

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  const options = [
    { id: 'Credit Card', label: 'Credit / Debit Card' },
    { id: 'PayPal', label: 'PayPal' },
    { id: 'Cash On Delivery', label: 'Cash On Delivery' },
  ];

  return (
    <div className="container" style={{ maxWidth: 560, paddingTop: 24 }}>
      <CheckoutSteps step1 step2 step3 />
      <div className="checkout-panel">
        <h3>Payment Method</h3>
        <form onSubmit={submitHandler}>
          {options.map((option) => (
            <label
              key={option.id}
              className={`payment-option ${paymentMethod === option.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.id}
                checked={paymentMethod === option.id}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              {option.label}
            </label>
          ))}
          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 16 }}>
            Continue to Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentScreen;
