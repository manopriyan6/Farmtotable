import React, { useState } from 'react';
import { Calendar, DollarSign, Hash, QrCode, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onViewDetails }) => {
  const [showQR, setShowQR] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleShowQR = () => {
    setShowQR(true);
  };

  const handleDownloadQR = () => {
    if (product.qr_code_url) {
      const link = document.createElement('a');
      link.href = product.qr_code_url;
      link.download = `${product.name}-qr-code.png`;
      link.click();
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await onDelete(product.id);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formattedDate = format(new Date(product.prepared_date), 'MMM dd, yyyy');
  const daysAgo = Math.floor((Date.now() - new Date(product.prepared_date).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails(product)}
              className="p-2 text-gray-500 hover:text-green-600 transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={handleShowQR}
              className="p-2 text-gray-500 hover:text-green-600 transition-colors"
              title="Show QR Code"
            >
              <QrCode className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete Product"
            >
              <Trash2 className={`h-4 w-4 ${deleteLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

        {/* Status indicator */}
        <div className="mb-4">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            daysAgo <= 1 ? 'bg-green-100 text-green-800' :
            daysAgo <= 3 ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {daysAgo === 0 ? 'Fresh Today' :
             daysAgo === 1 ? '1 day old' :
             `${daysAgo} days old`}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Hash className="h-4 w-4 mr-2 text-green-600" />
            <span>Qty: {product.quantity} kg</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-mono">₹{product.price}</span>
          </div>
          <div className="flex items-center text-gray-600 col-span-2">
            <Calendar className="h-4 w-4 mr-2 text-green-600" />
            <span>Prepared: {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                QR Code for {product.name}
              </h3>
              
              <div className="text-center mb-4">
                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  QR Code Active
                </div>
              </div>
              
              {product.qr_code_url && !imageError ? (
                <div className="mb-4">
                  <img
                    src={product.qr_code_url}
                    alt={`QR Code for ${product.name}`}
                    className="mx-auto w-48 h-48 border border-gray-200 rounded-lg"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="mb-4 w-48 h-48 mx-auto bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-sm">QR Code not available</p>
                </div>
              )}

              <p className="text-sm text-gray-600 mb-6">
                Customers can scan this QR code to view product details
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowQR(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {product.qr_code_url && !imageError && (
                  <button
                    onClick={handleDownloadQR}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};