import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Pagination from '../components/Pagination';
import { fetchProducts, fetchCategories } from '../features/products/productSlice';

const ShopScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items, page, pages, total, categories, loading, error } = useSelector(
    (state) => state.products
  );

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page')) || 1;

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        keyword: keyword || undefined,
        category: category !== 'all' ? category : undefined,
        sort,
        page: currentPage,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        limit: 8,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, keyword, category, sort, currentPage, minPrice, maxPrice]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete('page');
    setSearchParams(next);
  };

  const handlePriceFilter = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set('minPrice', minPrice); else next.delete('minPrice');
    if (maxPrice) next.set('maxPrice', maxPrice); else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
  };

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container">
      <div className="breadcrumbs">
        <span>Home</span>
        <span className="sep">/</span>
        <span>Shop</span>
      </div>

      <div className="shop-layout">
        <aside className="filter-panel">
          <div className="filter-group">
            <h4>Category</h4>
            <label className="filter-option">
              <input
                type="radio"
                name="category"
                checked={category === 'all'}
                onChange={() => updateParam('category', '')}
              />
              All Categories
            </label>
            {categories.map((cat) => (
              <label className="filter-option" key={cat}>
                <input
                  type="radio"
                  name="category"
                  checked={category === cat}
                  onChange={() => updateParam('category', cat)}
                />
                {cat}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Price Range</h4>
            <form className="price-range-inputs" onSubmit={handlePriceFilter}>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span>&ndash;</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              <button type="submit" className="btn btn-outline btn-sm">Go</button>
            </form>
          </div>
        </aside>

        <div>
          <div className="shop-toolbar">
            <span style={{ color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
              {total} {total === 1 ? 'product' : 'products'} found
              {keyword && ` for "${keyword}"`}
            </span>
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {loading ? (
            <Loader fullPage />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination page={page} pages={pages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopScreen;
