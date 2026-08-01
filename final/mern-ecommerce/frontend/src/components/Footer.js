import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-brand">
            Store<span>house</span>
          </div>
          <p className="footer-about">
            Thoughtfully sourced goods for everyday life — apparel, home, and accessories
            built to last.
          </p>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/shop">All Products</Link>
          <Link to="/shop?category=Apparel">Apparel</Link>
          <Link to="/shop?category=Bags">Bags</Link>
          <Link to="/shop?category=Home">Home</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/profile">My Profile</Link>
          <Link to="/orders">Order History</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <Link to="/">Shipping & Returns</Link>
          <Link to="/">Contact Us</Link>
          <Link to="/">FAQ</Link>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {year} Storehouse. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
