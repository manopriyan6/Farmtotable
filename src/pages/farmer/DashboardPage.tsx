import React, { useEffect, useState } from 'react';
import { Package, Plus, TrendingUp, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase, Product } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ProductForm } from '../../components/farmer/ProductForm';
import { ProductCard } from '../../components/farmer/ProductCard';
import { ProductDetails } from '../../components/ProductDetails';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchProducts();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const subscription = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `farmer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchProducts(); // Refresh products on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchProducts = async () => {
    if (!user) return;

    try {
      setError('');
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          user_profiles (
            id,
            full_name,
            farm_name,
            role
          )
        `)
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      setError('');
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('farmer_id', user?.id); // Security: only allow deleting own products

      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== productId));
      setSuccess('Product deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product. Please try again.');
    }
  };

  const handleProductAdded = () => {
    setShowAddForm(false);
    setSuccess('Product added successfully! Your QR code has been generated.');
    setTimeout(() => setSuccess(''), 5000);
    fetchProducts(); // Refresh the products list
  };

  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, product) => sum + (product.price * product.quantity), 0),
    recentProducts: products.filter(p => {
      const createdDate = new Date(p.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate >= weekAgo;
    }).length,
    averagePrice: products.length > 0 
      ? products.reduce((sum, product) => sum + product.price, 0) / products.length 
      : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (selectedProduct) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
          <button
            onClick={() => setSelectedProduct(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        <ProductDetails product={selectedProduct} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            {profile?.farm_name ? `${profile.farm_name} Dashboard` : 'Farmer Dashboard'}
          </p>
          <p className="text-sm text-green-600 mt-2">
            ✨ Manage your products, generate QR codes, and connect with customers
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>{products.length === 0 ? 'Add Your First Product' : 'Add Product'}</span>
          </button>
        </div>
      </div>

      {/* Quick Start Guide - Show when no products */}
      {products.length === 0 && !showAddForm && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">🚀 Quick Start Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-medium text-green-900">Add Products</h4>
                <p className="text-sm text-green-700">List your fresh produce with details and pricing</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-medium text-green-900">Get QR Codes</h4>
                <p className="text-sm text-green-700">Automatic QR code generation for each product</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-medium text-green-900">Connect Customers</h4>
                <p className="text-sm text-green-700">Customers scan QR codes to see your farm story</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Inventory Value</h3>
              <p className="text-2xl font-bold text-gray-900 font-mono">₹{stats.totalValue.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Added This Week</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.recentProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg Price</h3>
              <p className="text-2xl font-bold text-gray-900 font-mono">₹{stats.averagePrice.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <ProductForm
          onSuccess={handleProductAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Your Products</h2>
              <p className="text-gray-600">Manage your product listings and QR codes</p>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDeleteProduct}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      ) : !showAddForm ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to showcase your fresh produce?</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Add your first product to start connecting with customers and building trust through transparency.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Product
            </button>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>🌱 Fresh produce</span>
              <span>📱 Auto QR codes</span>
              <span>🔗 Customer connection</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};