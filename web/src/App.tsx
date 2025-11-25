import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import StoreList from './components/StoreList';
import StoreDetail from './components/StoreDetail';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <h1>Inventory Management</h1>
            <nav className="nav-links">
              <Link to="/analytics" className="nav-link">Analytics</Link>
              <Link to="/products" className="nav-link">Products</Link>
              <Link to="/stores" className="nav-link">Stores</Link>
            </nav>
          </div>
        </header>
        
        <main className="App-main">
          <Routes>
            <Route path="/" element={<AnalyticsDashboard />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/new" element={<ProductDetail />} />
            <Route path="/stores" element={<StoreList />} />
            <Route path="/stores/:id" element={<StoreDetail />} />
            <Route path="/stores/new" element={<StoreDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
