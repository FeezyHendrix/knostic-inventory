import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { StoreService } from '../services/api';
import { Store } from '../types/api';

const StoreList: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await StoreService.getStores();
      
      if (response.success && response.data) {
        setStores(response.data.data);
      } else {
        setError(response.error || 'Failed to load stores');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const deleteStore = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this store? This will also delete all associated products.')) return;

    try {
      const response = await StoreService.deleteStore(id);
      if (response.success) {
        toast.success('Store deleted successfully');
        await loadStores();
      } else {
        toast.error(response.error || 'Failed to delete store');
        setError(response.error || 'Failed to delete store');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to delete store';
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div>
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Stores</h2>
        <Link to="/stores/new" className="btn">Add New Store</Link>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <p>Loading stores...</p>
      ) : stores?.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No stores found. <Link to="/stores/new">Create your first store</Link></p>
        </div>
      ) : (
        <table border={1} cellPadding="10" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Store Name</th>
              <th>Address</th>
              <th>City, State, Zip</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores?.map(store => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td>{store.address}</td>
                <td>{store.city}, {store.state} {store.zip_code}</td>
                <td>{store.phone_number}</td>
                <td>{store.email}</td>
                <td>
                  <Link to={`/stores/${store.id}`} className="btn btn-sm">Edit</Link>
                  {' '}
                  <Link to={`/products?storeId=${store.id}`} className="btn btn-sm btn-secondary">Products</Link>
                  {' '}
                  <button onClick={() => deleteStore(store.id)} className="btn btn-sm btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StoreList;