import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { fetchProducts, fetchTopProducts } from '../features/products/productSlice';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { items, topProducts, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, sort: 'newest' }));
    dispatch(fetchTopProducts());
  }, [dispatch]);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-eyebrow">New Season Arrivals</div>
            <h1 className="hero-title">
              Everyday goods, <em>made to last</em>
            </h1>
            <p className="hero-subtitle">
              Thoughtfully sourced apparel, bags, and home essentials — crafted by small
              makers and delivered to your door.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-brass btn-lg">
                Shop the Collection
              </Link>
              <Link to="/shop?category=Apparel" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(251,248,242,0.4)', color: '#fbf8f2' }}>
                New Apparel
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
              alt="Featured collection"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Top Rated</span>
              <h2>Customer Favorites</h2>
            </div>
            <Link to="/shop" className="btn btn-ghost">
              View All &rarr;
            </Link>
          </div>
          {topProducts.length > 0 && (
            <div className="product-grid" style={{ marginBottom: 'var(--space-8)' }}>
              {topProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="section-heading">
            <div>
              <span className="eyebrow">Just In</span>
              <h2>New Arrivals</h2>
            </div>
          </div>

          {loading ? (
            <Loader fullPage />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <div className="product-grid">
              {items.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default HomeScreen;
