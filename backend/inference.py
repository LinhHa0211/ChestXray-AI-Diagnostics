import torch
import time
from pathlib import Path
from typing import Dict, List, Union
from .models import get_model
from .preprocessing import preprocess_image, preprocess_image_from_bytes


# Configuration mapping
CONFIG_SETTINGS = {
    'config1': {'image_size': 224, 'learning_rate': 1e-4, 'loss': 'focal', 'type': 'CNN'},
    'config2': {'image_size': 320, 'learning_rate': 3e-4, 'loss': 'focal', 'type': 'CNN'},
    'config3': {'image_size': 224, 'learning_rate': 1e-4, 'loss': 'focal', 'type': 'CNN-Transformer'},
    'config4': {'image_size': 224, 'learning_rate': 1e-4, 'loss': 'asymmetric', 'type': 'CNN+CNN-Transformer'},
}

# Model filename mapping
MODEL_FILENAME_MAP = {
    'densenet121': 'densenet121.pth',
    'efficientnet-b2': 'efficientnet-b2.pth',
    'regnety-800mf': 'regnety-800mf.pth',
    'efficientformerv2-s2': 'efficientformerv2-s2.pth',
    'mobilevit-s': 'mobilevit-s.pth',
}

# Model-Config compatibility mapping
MODEL_CONFIG_COMPATIBILITY = {
    'densenet121': ['config1', 'config2', 'config4'],
    'efficientnet-b2': ['config1', 'config2', 'config4'],
    'regnety-800mf': ['config1', 'config2', 'config4'],  # Added config4
    'efficientformerv2-s2': ['config3', 'config4'],
    'mobilevit-s': ['config3', 'config4'],
}


class ModelInference:
    def __init__(
        self,
        models_dir: str = "./models",
        device: str = None,
        num_classes: int = 6,
        dropout: float = 0.3
    ):
        self.models_dir = Path(models_dir)
        self.device = device if device else ('cuda' if torch.cuda.is_available() else 'cpu')
        self.num_classes = num_classes
        self.dropout = dropout
        self.loaded_models = {}

        print(f"Inference engine initialized")
        print(f"  Device: {self.device}")
        print(f"  Models directory: {self.models_dir}")

    def get_model_path(self, model_name: str, config: str) -> Path:
        """Get the path to the model file"""
        if config not in CONFIG_SETTINGS:
            raise ValueError(f"Config '{config}' not recognized. Available: {list(CONFIG_SETTINGS.keys())}")

        if model_name not in MODEL_FILENAME_MAP:
            raise ValueError(f"Model '{model_name}' not recognized. Available: {list(MODEL_FILENAME_MAP.keys())}")

        filename = MODEL_FILENAME_MAP[model_name]
        model_path = self.models_dir / config / filename

        if not model_path.exists():
            raise FileNotFoundError(
                f"Model file not found: {model_path}\n"
                f"Please ensure the model is trained and saved in the correct location."
            )

        return model_path

    def check_compatibility(self, model_name: str, config: str) -> bool:
        if model_name not in MODEL_CONFIG_COMPATIBILITY:
            return False
        return config in MODEL_CONFIG_COMPATIBILITY[model_name]

    def load_model(self, model_name: str, config: str) -> torch.nn.Module:
        cache_key = f"{model_name}_{config}"

        # Return cached model if already loaded
        if cache_key in self.loaded_models:
            print(f"Using cached model: {cache_key}")
            return self.loaded_models[cache_key]

        # Validate config and model first
        if config not in CONFIG_SETTINGS:
            raise ValueError(f"Invalid config '{config}'. Available: {list(CONFIG_SETTINGS.keys())}")

        if model_name not in MODEL_FILENAME_MAP:
            raise ValueError(f"Invalid model '{model_name}'. Available: {list(MODEL_FILENAME_MAP.keys())}")

        # Check compatibility
        if not self.check_compatibility(model_name, config):
            compatible_configs = MODEL_CONFIG_COMPATIBILITY.get(model_name, [])
            raise ValueError(
                f"Model '{model_name}' is not compatible with '{config}'.\n"
                f"Compatible configs for {model_name}: {compatible_configs}\n"
                f"Config types:\n"
                f"  - config1: CNN models, 224x224, Focal Loss\n"
                f"  - config2: CNN models, 320x320, Focal Loss\n"
                f"  - config3: CNN-Transformer models, 224x224, Focal Loss\n"
                f"  - config4: All models, 224x224, Asymmetric Loss"
            )

        print(f"Loading model: {model_name} with {config}")

        # Get model path
        model_path = self.get_model_path(model_name, config)

        # Get image size from config
        img_size = CONFIG_SETTINGS[config]['image_size']

        # Initialize model architecture
        model = get_model(
            model_name,
            num_classes=self.num_classes,
            dropout=self.dropout,
            img_size=img_size
        )

        # Load weights
        checkpoint = torch.load(model_path, map_location=self.device)

        # Handle different checkpoint formats
        if isinstance(checkpoint, dict):
            if 'model_state_dict' in checkpoint:
                model.load_state_dict(checkpoint['model_state_dict'])
                print(f"  Loaded from checkpoint format (epoch {checkpoint.get('epoch', 'unknown')})")
            elif 'state_dict' in checkpoint:
                model.load_state_dict(checkpoint['state_dict'])
                print(f"  Loaded from state_dict format")
            else:
                # Try loading directly
                model.load_state_dict(checkpoint)
                print(f"  Loaded model weights directly")
        else:
            # Checkpoint is state_dict itself
            model.load_state_dict(checkpoint)
            print(f"  Loaded model weights")

        # Move to device and set to eval mode
        model = model.to(self.device)
        model.eval()

        # Cache the model
        self.loaded_models[cache_key] = model

        print(f"Model loaded successfully: {cache_key}")
        return model

    @torch.no_grad()
    def predict(
        self,
        image_input: Union[str, Path, bytes],
        model_name: str,
        config: str,
        diseases: List[str]
    ) -> Dict:
        start_time = time.time()

        # Load model
        try:
            model = self.load_model(model_name, config)
        except (ValueError, FileNotFoundError) as e:
            return {
                'success': False,
                'error': str(e),
                'results': [],
                'processing_time': 0.0,
                'model_name': model_name,
                'config': config,
                'image_size': CONFIG_SETTINGS.get(config, {}).get('image_size', 0),
                'device': self.device
            }

        # Get image size from config
        img_size = CONFIG_SETTINGS[config]['image_size']

        # Preprocess image
        try:
            if isinstance(image_input, (str, Path)):
                image_tensor = preprocess_image(str(image_input), size=img_size)
            else:
                # Assume bytes
                image_tensor = preprocess_image_from_bytes(image_input, size=img_size)
        except Exception as e:
            return {
                'success': False,
                'error': f"Image preprocessing failed: {str(e)}",
                'results': [],
                'processing_time': time.time() - start_time,
                'model_name': model_name,
                'config': config,
                'image_size': img_size,
                'device': self.device
            }

        # Move to device
        image_tensor = image_tensor.to(self.device)

        # Run inference
        try:
            if self.device == 'cuda':
                with torch.amp.autocast('cuda'):
                    logits = model(image_tensor)
            else:
                logits = model(image_tensor)
        except Exception as e:
            return {
                'success': False,
                'error': f"Model inference failed: {str(e)}",
                'results': [],
                'processing_time': time.time() - start_time,
                'model_name': model_name,
                'config': config,
                'image_size': img_size,
                'device': self.device
            }

        # Convert to probabilities
        probs = torch.sigmoid(logits).cpu().numpy()[0]

        # Create results
        results = []
        for disease, prob in zip(diseases, probs):
            results.append({
                'disease': disease,
                'prob': float(prob)
            })

        # Calculate processing time
        processing_time = time.time() - start_time

        return {
            'success': True,
            'results': results,
            'processing_time': processing_time,
            'model_name': model_name,
            'config': config,
            'image_size': img_size,
            'device': self.device
        }

    def clear_cache(self):
        self.loaded_models.clear()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        print("Model cache cleared")

    def get_available_models(self) -> Dict:
        available = {}

        for config_name in CONFIG_SETTINGS.keys():
            config_dir = self.models_dir / config_name
            if not config_dir.exists():
                continue

            available[config_name] = {
                'image_size': CONFIG_SETTINGS[config_name]['image_size'],
                'loss': CONFIG_SETTINGS[config_name]['loss'],
                'type': CONFIG_SETTINGS[config_name]['type'],
                'models': []
            }

            for model_name, filename in MODEL_FILENAME_MAP.items():
                model_path = config_dir / filename
                if model_path.exists():
                    # Check if compatible
                    is_compatible = self.check_compatibility(model_name, config_name)
                    available[config_name]['models'].append({
                        'name': model_name,
                        'filename': filename,
                        'compatible': is_compatible,
                        'path': str(model_path)
                    })
        
        return available