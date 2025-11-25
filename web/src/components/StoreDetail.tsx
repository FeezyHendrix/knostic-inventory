import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StoreService } from '../services/api';
import { CreateStoreDto } from '../types/api';

const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [store, setStore] = useState<CreateStoreDto>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing) {
      loadStore();
    }
  }, [id]);

  const loadStore = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await StoreService.getStoreById(Number(id));
      
      if (response.success && response.data) {
        const storeData = response.data;
        setStore({
          name: storeData.name,
          address: storeData.address,
          city: storeData.city,
          state: storeData.state,
          zipCode: storeData.zip_code,
          phoneNumber: storeData.phone_number,
          email: storeData.email,
        });
      } else {
        setError(response.error || 'Failed to load store');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!store.name.trim()) {
      errors.name = 'Store name is required';
    }

    if (!store.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!store.city.trim()) {
      errors.city = 'City is required';
    }

    if (!store.state.trim()) {
      errors.state = 'State is required';
    }

    if (!store.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
    }

    if (!store.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }

    if (!store.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(store.email)) {
      errors.email = 'Please enter a valid email address';
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
        response = await StoreService.updateStore(Number(id), store);
      } else {
        response = await StoreService.createStore(store);
      }

      if (response.success) {
        toast.success(`Store ${isEditing ? 'updated' : 'created'} successfully`);
        navigate('/stores');
      } else {
        toast.error(response.error || `Failed to ${isEditing ? 'update' : 'create'} store`);
        setError(response.error || `Failed to ${isEditing ? 'update' : 'create'} store`);
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
      const errorMsg = err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} store`;
      toast.error(errorMsg);
      setError(errorMsg);
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

  const handleInputChange = (field: keyof CreateStoreDto, value: string) => {
    setStore(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (loading) {
    return <div className="loading">Loading store...</div>;
  }

  return (
    <div>
      <h2>{isEditing ? 'Edit Store' : 'Create New Store'}</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Store Name *</label>
          <input
            type="text"
            value={store.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter store name"
          />
          {validationErrors.name && <div className="error">{validationErrors.name}</div>}
        </div>

        <div className="form-group">
          <label>Address *</label>
          <input
            type="text"
            value={store.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter street address"
          />
          {validationErrors.address && <div className="error">{validationErrors.address}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              value={store.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Enter city"
            />
            {validationErrors.city && <div className="error">{validationErrors.city}</div>}
          </div>

          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              value={store.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="Enter state"
            />
            {validationErrors.state && <div className="error">{validationErrors.state}</div>}
          </div>

          <div className="form-group">
            <label>ZIP Code *</label>
            <input
              type="text"
              value={store.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              placeholder="Enter ZIP code"
            />
            {validationErrors.zipCode && <div className="error">{validationErrors.zipCode}</div>}
          </div>
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            value={store.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="Enter phone number"
          />
          {validationErrors.phoneNumber && <div className="error">{validationErrors.phoneNumber}</div>}
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={store.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
          />
          {validationErrors.email && <div className="error">{validationErrors.email}</div>}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" disabled={saving} className="btn">
            {saving ? 'Saving...' : (isEditing ? 'Update Store' : 'Create Store')}
          </button>
          <button type="button" onClick={() => navigate('/stores')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreDetail;