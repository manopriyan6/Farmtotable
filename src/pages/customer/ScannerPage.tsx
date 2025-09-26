import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '../../components/customer/QRScanner';
import { AlertCircle, Package, Sprout } from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (result: string) => {
    setIsScanning(false);
    try {
      const url = new URL(result);
      const pathParts = url.pathname.split('/');
      
      if (pathParts[1] === 'product' && pathParts[2]) {
        const productId = pathParts[2];
        navigate(`/product/${productId}`);
      } else {
        setError('Invalid QR code. Please scan a valid product QR code.');
      }
    } catch (err) {
      setError('Invalid QR code format. Please scan a valid product QR code.');
    }
  };

  const handleError = (errorMessage: string) => {
    setIsScanning(false);
    setError(errorMessage);
  };

  const handleScanStart = () => {
    setError('');
    setIsScanning(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan Product QR Code</h1>
        <p className="text-gray-600">
          Point your camera at a product QR code to view detailed information about its origin and freshness.
        </p>
        <p className="text-sm text-green-600 mt-2">
          ✨ Discover the story behind your food - from farm to your table
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <QRScanner 
            onScan={handleScan} 
            onError={handleError}
          />
        </div>
        
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">📱 How to scan:</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>Click "Start Scanning" to activate your camera</li>
              <li>Point your camera at the QR code on the product</li>
              <li>Hold steady until the code is automatically detected</li>
              <li>View detailed product information instantly</li>
            </ol>
          </div>

          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">🌱 What you'll discover:</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-green-800">Farmer name and farm details</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-green-800">Exact harvest/preparation date</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-green-800">Product description and pricing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-green-800">Freshness guarantee information</span>
              </div>
            </div>
          </div>
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <p className="text-sm text-blue-600">Camera is starting... Please allow camera access when prompted.</p>
          </div>
        </div>
      )}

          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">🔍 Need help?</h3>
            <div className="space-y-2 text-sm text-green-800">
              <p>• Make sure the QR code is clear and well-lit</p>
              <p>• Allow camera permissions when prompted</p>
              <p>• Try refreshing the page if camera doesn't start</p>
              <p>• Hold your device steady while scanning</p>
              <p>• The QR code should be from a FarmConnect product</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};