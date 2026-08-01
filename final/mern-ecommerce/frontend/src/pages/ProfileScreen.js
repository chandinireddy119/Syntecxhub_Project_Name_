import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { updateProfile, clearAuthError } from '../features/auth/authSlice';
import Loader from '../components/Loader';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState(userInfo?.shippingAddress?.address || '');
  const [city, setCity] = useState(userInfo?.shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(userInfo?.shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(userInfo?.shippingAddress?.country || '');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    setFormError('');

    if (password && password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    if (password && password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    const payload = {
      name,
      email,
      shippingAddress: { address, city, postalCode, country },
    };
    if (password) payload.password = password;

    dispatch(updateProfile(payload)).then((res) => {
      if (!res.error) toast.success('Profile updated successfully');
    });
  };

  return (
    <div className="container" style={{ maxWidth: 560, paddingTop: 24, paddingBottom: 48 }}>
      <h1 style={{ marginBottom: 24, fontSize: '1.8rem' }}>My Profile</h1>

      <div className="checkout-panel">
        {formError && <div className="form-error" style={{ marginBottom: 16 }}>{formError}</div>}

        <form onSubmit={submitHandler}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-control"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <h3 style={{ margin: '20px 0 12px', fontSize: '1rem' }}>Default Shipping Address</h3>

          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input
              id="address"
              type="text"
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="postalCode">Postal Code</label>
              <input
                id="postalCode"
                type="text"
                className="form-control"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              type="text"
              className="form-control"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          {loading && <Loader />}
        </form>
      </div>
    </div>
  );
};

export default ProfileScreen;
