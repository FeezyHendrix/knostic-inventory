import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductService, StoreService } from '../services/api';
import { Store, CreateProductDto, UpdateProductDto } from '../types/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [product, setProduct] = useState<CreateProductDto>({
    storeId: 0,
    name: '',
    description: '',
    category: '',
    price: '',
    quantityInStock: 0,
    sku: '',
  });

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadStores();
    if (isEditing) {
      loadProduct();
    }
  }, [id]);

  const loadStores = async () => {
    try {
      const response = await StoreService.getStores();
      if (response.success && response.data) {
        setStores(response.data.data);
        if (!isEditing && response.data.data.length > 0) {
          setProduct(prev => ({ ...prev, storeId: response.data!.data[0].id }));
        }
      }
    } catch (err) {
      console.warn('Failed to load stores');
    }
  };

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ProductService.getProductById(Number(id));
      
      if (response.success && response.data) {
        const productData = response.data;
        setProduct({
          storeId: productData.storeId,
          name: productData.name,
          description: productData.description || '',
          category: productData.category,
          price: productData.price,
          quantityInStock: productData.quantityInStock,
          sku: productData.sku,
        });
      } else {
        setError(response.error || 'Failed to load product');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!product.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!product.category.trim()) {
      errors.category = 'Category is required';
    }

    if (!product.sku.trim()) {
      errors.sku = 'SKU is required';
    }

    if (!product.price.trim()) {
      errors.price = 'Price is required';
    } else if (!/^\d+(\.\d{1,2})?$/.test(product.price)) {
      errors.price = 'Price must be a valid decimal with up to 2 decimal places';
    }

    if (product.quantityInStock < 0) {
      errors.quantityInStock = 'Quantity must be non-negative';
    }

    if (product.storeId <= 0) {
      errors.storeId = 'Please select a store';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      let response;
      
      if (isEditing) {
        const updateData: UpdateProductDto = { ...product };
        delete (updateData as any).storeId; // Can't update store ID
        response = await ProductService.updateProduct(Number(id), updateData);
      } else {
        response = await ProductService.createProduct(product);
      }

      if (response.success) {
        navigate('/products');
      } else {
        setError(response.error || `Failed to ${isEditing ? 'update' : 'create'} product`);
        if (response.details) {
          const fieldErrors: Record<string, string> = {};
          response.details.forEach((detail: any) => {
            if (detail.path && detail.path.length > 0) {
              fieldErrors[detail.path[0]] = detail.message;
            }
          });
          setValidationErrors(fieldErrors);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} product`);
      if (err.response?.data?.details) {
        const fieldErrors: Record<string, string> = {};
        err.response.data.details.forEach((detail: any) => {
          if (detail.path && detail.path.length > 0) {
            fieldErrors[detail.path[0]] = detail.message;
          }
        });
        setValidationErrors(fieldErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CreateProductDto, value: any) => {
    setProduct(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  return (
    <div>
      <h2>{isEditing ? 'Edit Product' : 'Create New Product'}</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Store *</label>
          <select
            value={product.storeId}
            onChange={(e) => handleInputChange('storeId', Number(e.target.value))}
            disabled={isEditing} // Can't change store when editing
          >
            <option value={0}>Select a store</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          {validationErrors.storeId && <div className="error">{validationErrors.storeId}</div>}
        </div>

        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter product name"
          />
          {validationErrors.name && <div className="error">{validationErrors.name}</div>}
        </div>

        <div className="form-group">
          <label>SKU *</label>
          <input
            type="text"
            value={product.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            placeholder="Enter SKU"
          />
          {validationErrors.sku && <div className="error">{validationErrors.sku}</div>}
        </div>

        <div className="form-group">
          <label>Category *</label>
          <input
            type="text"
            value={product.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="Enter category"
          />
          {validationErrors.category && <div className="error">{validationErrors.category}</div>}
        </div>

        <div className="form-group">
          <label>Price *</label>
          <input
            type="text"
            value={product.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="0.00"
          />
          {validationErrors.price && <div className="error">{validationErrors.price}</div>}
        </div>

        <div className="form-group">
          <label>Quantity in Stock</label>
          <input
            type="number"
            min="0"
            value={product.quantityInStock}
            onChange={(e) => handleInputChange('quantityInStock', Number(e.target.value))}
          />
          {validationErrors.quantityInStock && <div className="error">{validationErrors.quantityInStock}</div>}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={product.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            placeholder="Enter product description (optional)"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" disabled={saving} className="btn">
            {saving ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductDetail;