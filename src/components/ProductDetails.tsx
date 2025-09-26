import React from 'react';
import { Calendar, DollarSign, Hash, User, MapPin, Package } from 'lucide-react';
import { format } from 'date-fns';
import { Product } from '../lib/supabase';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8 text-white">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-green-100 mt-1">Fresh from the farm</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Product Description</h2>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-lg font-semibold text-gray-900 font-mono">₹{product.price}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Hash className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Quantity</p>
                <p className="text-lg font-semibold text-gray-900 font-mono">{product.quantity} kg</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prepared Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(product.prepared_date), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>

            {product.user_profiles && (
              <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {product.user_profiles.farm_name ? 'Farm' : 'Farmer'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {product.user_profiles.farm_name || product.user_profiles.full_name}
                  </p>
                  {product.user_profiles.farm_name && (
                    <p className="text-sm text-gray-500">{product.user_profiles.full_name}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Freshness Indicator */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">Farm Fresh Product</span>
            </div>
            <p className="text-sm text-green-600">
              Prepared {format(new Date(product.prepared_date), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};