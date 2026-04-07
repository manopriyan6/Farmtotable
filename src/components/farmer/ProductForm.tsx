import React, { useState } from 'react';
import { Package, Calendar, DollarSign, Hash, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import QRCode from 'qrcode';

interface ProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    price: '',
    prepared_date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const generateQRCode = async (productId: string): Promise<string> => {
    const productUrl = `${window.location.origin}/product/${productId}`;
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(productUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#059669',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim() || !formData.description.trim() || !formData.quantity || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const product = await api.products.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        prepared_date: formData.prepared_date,
      });

      if (product?.id) {
        const qrCodeUrl = await generateQRCode(product.id);

        if (qrCodeUrl) {
          await api.products.update(product.id, {
            ...product,
            qr_code_url: qrCodeUrl,
          });
        }
      }

      onSuccess();

      setFormData({
        name: '',
        description: '',
        quantity: '',
        price: '',
        prepared_date: new Date().toISOString().split('T')[0],
      });

    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
      <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Product</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Package className="h-4 w-4 mr-2 text-green-600" />
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            placeholder="e.g., Fresh Organic Tomatoes"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="h-4 w-4 mr-2 text-green-600" />
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
            placeholder="Describe your product..."
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Hash className="h-4 w-4 mr-2 text-green-600" />
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="e.g., 50"
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              Price (₹)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="e.g., 120.00"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="prepared_date" className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 mr-2 text-green-600" />
            Prepared Date
          </label>
          <input
            type="date"
            id="prepared_date"
            name="prepared_date"
            value={formData.prepared_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">
            💡 A unique QR code will be automatically generated for this product once created.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};
