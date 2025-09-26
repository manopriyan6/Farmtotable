import React, { useRef, useState, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import { Camera, AlertCircle, CheckCircle, CameraOff, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const startScanning = async () => {
    setError('');
    setSuccess('');
    setPermissionDenied(false);
    setIsScanning(true);

    // Wait for the video element to be rendered
    setTimeout(async () => {
      if (!videoRef.current) {
        setError('Video element not available');
        setIsScanning(false);
        return;
      }

      try {
        cleanup();

        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Code scanned:', result.data);
            setSuccess('QR code scanned successfully! Redirecting...');
            
            setTimeout(() => {
              stopScanning();
              onScan(result.data);
            }, 1500);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        qrScannerRef.current = qrScanner;

        await qrScanner.start();

      } catch (err: any) {
        console.error('Scanner error:', err);
        setIsScanning(false);
        
        if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
          setPermissionDenied(true);
          setError('Camera permission denied. Please allow camera access to scan QR codes.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotSupportedError') {
          setError('QR scanning is not supported on this device or browser.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is being used by another application.');
        } else {
          setError(`Failed to start camera: ${err.message || 'Unknown error'}`);
        }

        if (onError) onError(err.message || 'Scanner initialization failed');
      }
    }, 100);
  };

  const stopScanning = () => {
    cleanup();
    setIsScanning(false);
    setError('');
    setSuccess('');
  };

  const retryPermission = async () => {
    setPermissionDenied(false);
    await startScanning();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan Product QR Code</h2>
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          </div>
        )}

        {permissionDenied && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center justify-center mb-3">
              <CameraOff className="h-5 w-5 text-amber-400 mr-2" />
              <p className="text-sm text-amber-600 font-medium">Camera Permission Required</p>
            </div>
            <p className="text-xs text-amber-600 mb-3">
              To scan QR codes, we need access to your camera. Please click "Allow" when prompted.
            </p>
            <button
              onClick={retryPermission}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
            >
              Grant Camera Permission
            </button>
          </div>
        )}
        
        {!isScanning ? (
          <div className="space-y-4">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <Camera className="h-12 w-12 text-green-600" />
            </div>
            <p className="text-gray-600">
              Click the button below to start your camera and scan QR codes
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                📷 We'll request camera permission when you start scanning
              </p>
            </div>
            <button
              onClick={startScanning}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Start Camera
            </button>
          </div>
        ) : isScanning ? (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <div className="absolute inset-4 border-2 border-green-400 rounded-lg pointer-events-none">
                <div className="w-full h-full border border-green-300 rounded-lg animate-pulse"></div>
              </div>
              <button
                onClick={stopScanning}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                📱 Point your camera at a QR code to scan it
              </p>
            </div>
            <button
              onClick={stopScanning}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Stop Camera
            </button>
          </div>
        ) : null}

        {/* Always render video element for ref access */}
        <video ref={videoRef} style={{ display: 'none' }} playsInline muted autoPlay />

        {error && !permissionDenied && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-600 font-medium">Camera Error</p>
            </div>
            <p className="text-xs text-red-600 mb-3">{error}</p>
            <button
              onClick={startScanning}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};