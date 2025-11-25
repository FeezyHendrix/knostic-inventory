import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ProductService, StoreService } from "../services/api";
import { Product, Store, ProductQuery } from "../types/api";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState<ProductQuery>({
    page: 1,
    limit: 12,
    sortBy: "name",
    sortOrder: "asc",
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ProductService.getProducts(filters);

      if (response.success && response.data) {
        setProducts(response.data.data);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.pages);
      } else {
        setError(response.error || "Failed to load products");
      }
    } catch (err: any) {
      console.log('err', err)
      setError(err.response?.data?.error || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      const response = await StoreService.getStores();
      if (response.success && response.data) {
        setStores(response.data.data);
      }
    } catch (err) {
      console.warn("Failed to load stores for filter");
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filters]);

  useEffect(() => {
    loadStores();
  }, []);

  const handleFilterChange = (key: keyof ProductQuery, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const response = await ProductService.deleteProduct(id);
      if (response.success) {
        toast.success("Product deleted successfully");
        await loadProducts();
      } else {
        toast.error(response.error || "Failed to delete product");
        setError(response.error || "Failed to delete product");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to delete product";
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div>
      <div
        className="header-actions"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2>Products</h2>
        <Link to="/products/new" className="btn">
          Add New Product
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="filters">
        <h3>Filters</h3>
        <div className="filter-row">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Store</label>
            <select
              value={filters.storeId || ""}
              onChange={(e) =>
                handleFilterChange(
                  "storeId",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            >
              <option value="">All Stores</option>
              {stores?.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              placeholder="Category"
              value={filters.category || ""}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            />
          </div>
        </div>
        <div className="filter-row">
          <div className="form-group">
            <label>Min Price</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={filters.minPrice || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
          <div className="form-group">
            <label>Max Price</label>
            <input
              type="number"
              step="0.01"
              placeholder="999.99"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
          <div className="form-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="quantityInStock">Stock</option>
              <option value="createdAt">Created</option>
            </select>
          </div>
          <div className="form-group">
            <label>Sort Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products?.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p>
            No products found.{" "}
            <Link to="/products/new">Create your first product</Link>
          </p>
        </div>
      ) : (
        <>
          <table border={1} cellPadding="10" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Store</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.name}
                    {product.description && ` (${product.description})`}
                  </td>
                  <td>{product.sku}</td>
                  <td>{product.category}</td>
                  <td>${parseFloat(product.price).toFixed(2)}</td>
                  <td>{product.quantity_in_stock}</td>
                  <td>
                    {product.store && `${product.store.name} - ${product.store.city}, ${product.store.state}`}
                  </td>
                  <td>
                    <Link to={`/products/${product.id}`} className="btn btn-sm">Edit</Link>
                    {' '}
                    <button onClick={() => deleteProduct(product.id)} className="btn btn-sm btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </button>

              {[...Array(Math.min(totalPages, 10))].map((_, index) => {
                const pageNum =
                  currentPage <= 5 ? index + 1 : currentPage - 5 + index + 1;
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    className={currentPage === pageNum ? "active" : ""}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;
