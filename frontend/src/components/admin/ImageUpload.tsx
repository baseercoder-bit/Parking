import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { locationsApi } from '../../services/api';
import type { Location } from '../../services/api';

interface ImageUploadProps {
  locationId: string;
  currentImageUrl?: string | null;
  onImageUpdate: (imageUrl: string | null) => void;
}

export default function ImageUpload({ locationId, currentImageUrl, onImageUpdate }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError(null);

    // Read file as base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      handleUpload(base64String);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (imageDataUrl: string) => {
    setUploading(true);
    setError(null);

    try {
      const response = await locationsApi.updateImage(locationId, imageDataUrl);
      onImageUpdate(response.data.imageUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload image');
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    setError(null);

    try {
      const response = await locationsApi.updateImage(locationId, null);
      onImageUpdate(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border-2 border-slate-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Parking Lot Image</h3>
        {preview && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRemove}
            disabled={uploading}
            className="px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Remove
          </motion.button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4"
        >
          {error}
        </motion.div>
      )}

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Parking lot"
            className="w-full h-auto rounded-lg border-2 border-slate-200 shadow-md max-h-96 object-contain bg-gray-50"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No image uploaded</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <motion.label
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            htmlFor="image-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: 'var(--primary-blue)', color: 'var(--white)' }}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Image
              </>
            )}
          </motion.label>
          <p className="text-xs text-slate-500 mt-2">PNG, JPG, GIF up to 5MB</p>
        </div>
      )}

      {preview && !uploading && (
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-replace"
          />
          <motion.label
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            htmlFor="image-replace"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            Replace Image
          </motion.label>
        </div>
      )}
    </div>
  );
}
