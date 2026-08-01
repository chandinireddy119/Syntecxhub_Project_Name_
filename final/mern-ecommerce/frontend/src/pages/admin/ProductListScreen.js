import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { fetchProducts, deleteProductAdmin } from '../../features/products/productSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const ProductListScreen = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const deleteHandler = (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      dispatch(deleteProductAdmin(id)).then((res) => {
        if (!res.error) toast.success('Product deleted');
      });
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary">
          <FaPlus style={{ marginRight: 6 }} /> Add Product
        </Link>
      </div>

      {loading ? (
        <Loader fullPage />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img src={product.image} alt={product.name} className="admin-table-thumb" />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.countInStock}</td>
                  <td>
                    <div className="table-actions">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="btn btn-ghost btn-sm"
                        aria-label="Edit product"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--clay)' }}
                        onClick={() => deleteHandler(product._id, product.name)}
                        aria-label="Delete product"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductListScreen;
