import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaShoppingCart, FaHeart, FaUser, FaBars } from 'react-icons/fa';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const [keyword, setKeyword] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const submitSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          Store<span>house</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/wishlist">Wishlist</Link>
        </nav>

        <form className="navbar-search" onSubmit={submitSearch} role="search">
          <input
            type="text"
            placeholder="Search products..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Submit search">
            <FaSearch />
          </button>
        </form>

        <div className="navbar-actions">
          <Link to="/wishlist" className="navbar-icon-link" aria-label="Wishlist">
            <FaHeart />
            {wishlistItems.length > 0 && (
              <span className="navbar-badge">{wishlistItems.length}</span>
            )}
          </Link>

          <Link to="/cart" className="navbar-icon-link" aria-label="Cart">
            <FaShoppingCart />
            {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
          </Link>

          {userInfo ? (
            <div className="navbar-user">
              <button type="button" className="navbar-icon-link" aria-label="Account menu">
                <FaUser />
              </button>
              <div className="navbar-dropdown">
                <Link to="/profile">My Profile</Link>
                <Link to="/orders">Order History</Link>
                {userInfo.isAdmin && <Link to="/admin/dashboard">Admin Dashboard</Link>}
                <button type="button" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm">
              Sign In
            </Link>
          )}

          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="navbar-links"
          style={{ display: 'flex', flexDirection: 'column', padding: '16px 24px', gap: 12 }}
        >
          <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setMobileOpen(false)}>Shop</Link>
          <Link to="/wishlist" onClick={() => setMobileOpen(false)}>Wishlist</Link>
          <Link to="/cart" onClick={() => setMobileOpen(false)}>Cart</Link>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
