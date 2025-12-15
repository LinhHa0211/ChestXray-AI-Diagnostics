'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { HeaderSection } from '@/components/HeaderSection';
import { ConfigModelSelector } from '@/components/ConfigModelSelector';
import { ImageUpload } from '@/components/ImageUpload';
import { ThresholdToolbar } from '@/components/ThresholdToolbar';
import { RunAndResults } from '@/components/RunAndResults';
import {
  DISEASES,
  CONFIGS,
  CONFIG_MODELS,
  getDefaultModelForConfig,
  DEFAULT_THRESHOLDS,
  MODEL_THRESHOLDS
} from '@/constants';
import type { Result, Thresholds } from '@/types';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ChestXrayDemo() {
  const [config, setConfig] = useState('config1');
  const [model, setModel] = useState('densenet121');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [results, setResults] = useState<Result[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update thresholds when model changes
  useEffect(() => {
    if (MODEL_THRESHOLDS[model]) {
      setThresholds(MODEL_THRESHOLDS[model]);
    } else {
      setThresholds(DEFAULT_THRESHOLDS);
    }
  }, [model]);

  const handleUploadFile = useCallback((file: File | null) => {
    if (!file) {
      setImageFile(null);
      setImageUrl(null);
      setResults(null);
      setError(null);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Kích thước file quá lớn. Tối đa 10MB.');
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Định dạng file không hợp lệ. Chỉ chấp nhận PNG, JPG, JPEG.');
      return;
    }

    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setResults(null);
    setError(null);
  }, []);

  const handleThresholdChange = useCallback((disease: string, value: number) => {
    setThresholds(prev => ({ ...prev, [disease]: value }));
  }, []);

  const resetThresholds = useCallback(() => {
    if (MODEL_THRESHOLDS[model]) {
      setThresholds(MODEL_THRESHOLDS[model]);
    } else {
      setThresholds(DEFAULT_THRESHOLDS);
    }
  }, [model]);

  // Handle config change - automatically select first model of that config
  const handleConfigChange = useCallback((newConfig: string) => {
    setConfig(newConfig);
    const defaultModel = getDefaultModelForConfig(newConfig);
    setModel(defaultModel);
  }, []);

  const runModel = useCallback(async () => {
    if (!imageFile) {
      setError('Vui lòng tải ảnh lên trước.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('model', model);
      formData.append('config', config);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Lỗi khi xử lý ảnh');
      }

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        throw new Error(data.error || 'Lỗi không xác định');
      }
    } catch (err) {
      console.error('Error running model:', err);
      setError(err instanceof Error ? err.message : 'Lỗi khi kết nối đến server');

      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockResults: Result[] = DISEASES.map((disease) => ({
          disease,
          prob: Math.random() * 0.9 + 0.05
        }));
        setResults(mockResults);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [config, model, imageFile]);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <HeaderSection diseaseCount={DISEASES.length} />

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left Column - Config & Upload */}
          <div className="xl:col-span-1 space-y-6">
            <ConfigModelSelector
              config={config}
              model={model}
              configs={CONFIGS}
              models={CONFIG_MODELS[config] || []}
              onChangeConfig={handleConfigChange}
              onChangeModel={setModel}
            />

            <ImageUpload
              imageUrl={imageUrl}
              onUploadFile={handleUploadFile}
              isProcessing={isProcessing}
            />
          </div>

          {/* Middle Column - Results */}
          <div className="xl:col-span-1">
            <RunAndResults
              imageUrl={imageUrl}
              thresholds={thresholds}
              results={results}
              diseases={[...DISEASES]}
              onRun={runModel}
              isProcessing={isProcessing}
              error={error}
            />
          </div>

          {/* Right Column - Thresholds */}
          <div className="xl:col-span-1">
            <ThresholdToolbar
              diseases={[...DISEASES]}
              thresholds={thresholds}
              onChangeThreshold={handleThresholdChange}
              onReset={resetThresholds}
            />
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-600">
            <p>© Hà Ngọc Linh B2207536</p>
          </div>
        </div>
      </footer>
    </div>
  );
}