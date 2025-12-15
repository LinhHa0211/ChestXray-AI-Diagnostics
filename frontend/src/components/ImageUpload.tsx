import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, FileImage } from 'lucide-react';

interface ImageUploadProps {
  imageUrl: string | null;
  onUploadFile: (file: File | null) => void;
  isProcessing: boolean;
}

export function ImageUpload({ imageUrl, onUploadFile, isProcessing }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUploadFile(file);
    }
  }, [onUploadFile]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadFile(file);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <FileImage className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Tải lên ảnh X-quang ngực</h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!imageUrl ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-3 border-dashed rounded-2xl p-12 text-center 
              transition-all duration-300 cursor-pointer group
              ${isDragging
              ? 'border-emerald-500 bg-emerald-50 scale-[1.02]'
              : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50'
            }
            `}
          >
            <label className="cursor-pointer flex flex-col items-center">
              <div className={`
                p-6 rounded-2xl mb-4 transition-all duration-300
                ${isDragging
                ? 'bg-emerald-500 scale-110'
                : 'bg-emerald-100 group-hover:bg-emerald-200 group-hover:scale-105'
              }
              `}>
                <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-emerald-600'}`} />
              </div>
              <p className="text-base font-semibold text-gray-700 mb-2">
                {isDragging ? 'Thả ảnh vào đây' : 'Kéo thả ảnh vào đây'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                hoặc bấm để chọn file
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-4 py-2 rounded-full">
                <ImageIcon className="w-3 h-3" />
                <span>PNG, JPG, JPEG • Tối đa 10MB</span>
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Ảnh đã tải lên</span>
              </div>
              <button
                onClick={() => onUploadFile(null)}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
                Xóa
              </button>
            </div>
            <div className="relative border-2 border-gray-200 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-inner">
              <img
                src={imageUrl}
                alt="Chest X-ray"
                className="w-full h-auto object-contain max-h-[500px]"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-3"></div>
                    <p className="text-sm font-medium">Đang xử lý...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}