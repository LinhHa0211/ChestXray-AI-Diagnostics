// Type definitions for ChestXray AI Diagnostics

export interface Config {
  id: string;
  name: string;
  description: string;
  imgSize: number;
  learningRate: number;
}

export interface Model {
  id: string;
  name: string;
}

export interface Result {
  disease: string;
  prob: number;
}

export interface Thresholds {
  [disease: string]: number;
}

export interface PredictionRequest {
  image: File;
  config: string;
  model: string;
}

export interface PredictionResponse {
  success: boolean;
  results: Result[];
  processingTime: number;
  modelVersion: string;
  config: string;
  error?: string;
}