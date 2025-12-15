import type { Config, Model, Thresholds } from '@/types';

// Disease list matching the trained model
export const DISEASES = [
  'Atelectasis',
  'Edema',
  'Lung_Opacity',
  'Pleural_Effusion',
  'Pneumonia',
  'Pneumothorax'
] as const;

// Available configurations
export const CONFIGS: Config[] = [
  {
    id: 'config1',
    name: 'Config 1 - CNN, Focal Loss',
    description: 'Image: 224×224, LR: 1e-4',
    imgSize: 224,
    learningRate: 1e-4,
  },
  {
    id: 'config2',
    name: 'Config 2 - CNN, Focal Loss',
    description: 'Image: 320×320, LR: 3e-4',
    imgSize: 320,
    learningRate: 3e-4,
  },
  {
    id: 'config3',
    name: 'Config 3 - Hybrid, Focal Loss',
    description: 'Image: 224×224, LR: 1e-4',
    imgSize: 224,
    learningRate: 1e-4,
  },
  {
    id: 'config4',
    name: 'Config 4 - Asymmetric Loss',
    description: 'Image: 320×320, LR: 3e-4',
    imgSize: 224,
    learningRate: 1e-4,
  }
];

// Available models (full list)
export const ALL_MODELS: Model[] = [
  {
    id: 'densenet121',
    name: 'DenseNet121',
  },
  {
    id: 'efficientnet-b2',
    name: 'EfficientNet-B2',
  },
  {
    id: 'regnety-800mf',
    name: 'RegNetY-800MF',
  },
  {
    id: 'efficientformerv2-s2',
    name: 'EfficientFormerV2-S2',
  },
  {
    id: 'mobilevit-s',
    name: 'MobileViT-S',
  }
];

// Config-specific models mapping
export const CONFIG_MODELS: Record<string, Model[]> = {
  'config1': [
    ALL_MODELS[0], // densenet121
    ALL_MODELS[1], // efficientnet-b2
    ALL_MODELS[2], // regnety-800mf
  ],
  'config2': [
    ALL_MODELS[0], // densenet121
    ALL_MODELS[1], // efficientnet-b2
    ALL_MODELS[2], // regnety-800mf
  ],
  'config3': [
    ALL_MODELS[3], // efficientformerv2-s2
    ALL_MODELS[4], // mobilevit-s
  ],
  'config4': [
    ALL_MODELS[0], // densenet121
    ALL_MODELS[3], // efficientformerv2-s2
    ALL_MODELS[1], // efficientnet-b2
    ALL_MODELS[4], // mobilevit-s
    ALL_MODELS[2], // regnety-800mf
  ]
};

// Helper function to get models for a config
export const getModelsForConfig = (configId: string): Model[] => {
  return CONFIG_MODELS[configId] || [];
};

// Helper function to get default model for a config
export const getDefaultModelForConfig = (configId: string): string => {
  const models = CONFIG_MODELS[configId];
  return models && models.length > 0 ? models[0].id : 'densenet121';
};

// Default thresholds from DenseNet121 config1 training (best F1 thresholds)
// From notebook: Best epoch 7
export const DEFAULT_THRESHOLDS: Thresholds = {
  'Atelectasis': 0.05,       // From notebook: 0.050
  'Edema': 0.40,              // From notebook: 0.400
  'Lung_Opacity': 0.05,       // From notebook: 0.050
  'Pleural_Effusion': 0.30,   // From notebook: 0.300
  'Pneumonia': 0.35,          // From notebook: 0.350
  'Pneumothorax': 0.30        // From notebook: 0.300
};

// Model-specific thresholds (only DenseNet121 config1 has real data)
export const MODEL_THRESHOLDS: Record<string, Thresholds> = {
  'densenet121': {
    'Atelectasis': 0.1,
    'Edema': 0.60,
    'Lung_Opacity': 0.1,
    'Pleural_Effusion': 0.60,
    'Pneumonia': 0.55,
    'Pneumothorax': 0.55,
  },
  'efficientnet-b2': {
    'Atelectasis': 0.25,
    'Edema': 0.66,
    'Lung_Opacity': 0.25,
    'Pleural_Effusion': 0.55,
    'Pneumonia': 0.55,
    'Pneumothorax': 0.55,
  },
  'regnety-800mf': {
    'Atelectasis': 0.50,
    'Edema': 0.60,
    'Lung_Opacity': 0.10,
    'Pleural_Effusion': 0.60,
    'Pneumonia': 0.65,
    'Pneumothorax': 0.5,
  },
  'efficientformerv2-s2': {
    'Atelectasis': 0.1,
    'Edema': 0.60,
    'Lung_Opacity': 0.15,
    'Pleural_Effusion': 0.60,
    'Pneumonia': 0.55,
    'Pneumothorax': 0.55,
  },
  'mobilevit-s': {
    'Atelectasis': 0.1,
    'Edema': 0.75,
    'Lung_Opacity': 0.1,
    'Pleural_Effusion': 0.6,
    'Pneumonia': 0.55,
    'Pneumothorax': 0.6
  }
};

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],
  ACCEPTED_EXTENSIONS: ['.png', '.jpg', '.jpeg']
} as const;

// API endpoints
export const API_ENDPOINTS = {
  PREDICT: '/predict',
  HEALTH: '/health',
  MODELS: '/models',
  CONFIGS: '/configs',
  IMPLEMENTATION_STATUS: '/implementation-status'
} as const;