import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios, { getErrorMessage } from '../../utils/axiosConfig';
import {
  createProduct,
  updateProductAdmin,
  fetchProductDetails,
  clearProductDetails,
} from '../../features/products/productSlice';
import Loader from '../../components/Loader';

const ProductEditScreen = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { productDetails, detailsLoading } = useSelector((state) => state.products);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchProductDetails(id));
    }
    return () => dispatch(clearProductDetails());
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && productDetails) {
      setName(productDetails.name);
      setPrice(productDetails.price);
      setDiscountPrice(productDetails.discountPrice || '');
      setImage(productDetails.image);
      setBrand(productDetails.brand);
      setCategory(productDetails.category);
      setCountInStock(productDetails.countInStock);
      setDescription(productDetails.description);
    }
  }, [productDetails, isEditMode]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(`${process.env.REACT_APP_API_URL.replace('/api', '')}${data.image}`);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setSaving(true);

    const productData = {
      name,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      image,
      brand,
      category,
      countInStock: Number(countInStock),
      description,
    };

    const action = isEditMode
      ? updateProductAdmin({ id, productData })
      : createProduct(productData);

    const res = await dispatch(action);
    setSaving(false);

    if (!res.error) {
      toast.success(isEditMode ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    } else {
      toast.error(res.payload);
    }
  };

  if (isEditMode && detailsLoading) return <Loader fullPage />;

  return (
    <div>
      <div className="admin-header">
        <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <div className="admin-form-card">
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              id="name"
              type="text"
              className="form-control"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="discountPrice">Sale Price ($, optional)</label>
              <input
                id="discountPrice"
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                id="brand"
                type="text"
                className="form-control"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                className="form-control"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="countInStock">Stock Quantity</label>
            <input
              id="countInStock"
              type="number"
              min="0"
              className="form-control"
              required
              value={countInStock}
              onChange={(e) => setCountInStock(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-control"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              id="imageUrl"
              type="text"
              className="form-control"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... or upload below"
              style={{ marginBottom: 10 }}
            />
            <label htmlFor="imageUpload" className="image-upload-box" style={{ display: 'block' }}>
              {uploading ? 'Uploading...' : 'Click to upload an image file'}
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={uploadFileHandler}
                style={{ display: 'none' }}
              />
            </label>
            {image && <img src={image} alt="Preview" className="image-upload-preview" />}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={saving || uploading}>
            {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductEditScreen;
