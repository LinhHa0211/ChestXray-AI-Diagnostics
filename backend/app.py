from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn

from .inference import ModelInference, CONFIG_SETTINGS, MODEL_FILENAME_MAP, MODEL_CONFIG_COMPATIBILITY

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

# Configuration
DISEASES = [
    'Atelectasis',
    'Edema',
    'Lung_Opacity',
    'Pleural_Effusion',
    'Pneumonia',
    'Pneumothorax'
]

# Initialize FastAPI app
app = FastAPI(
    title="ChestXray AI Diagnostics API",
    description="Multi-label chest X-ray disease classification API with multiple models and configs",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize inference engine (lazy loading)
inference_engine: Optional[ModelInference] = None

def get_inference_engine() -> ModelInference:
    global inference_engine
    if inference_engine is None:
        inference_engine = ModelInference(models_dir=MODELS_DIR)
    return inference_engine

# Pydantic models
class PredictionResult(BaseModel):
    disease: str
    prob: float

class PredictionResponse(BaseModel):
    success: bool
    results: List[PredictionResult]
    processing_time: float
    model_name: str
    config: str
    image_size: int
    device: str
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    device: str
    available_configs: List[str]
    available_models: List[str]

class ModelInfo(BaseModel):
    name: str
    filename: str
    compatible: bool
    path: str

class ConfigInfo(BaseModel):
    image_size: int
    loss: str
    type: str
    models: List[ModelInfo]

@app.get("/", response_model=dict)
async def root():
    return {
        "message": "ChestXray AI Diagnostics API",
        "description": "Multi-label chest X-ray classification with multiple models and configs",
        "docs": "/docs",
        "configs": {
            "config1": "CNN models, 224x224, Focal Loss",
            "config2": "CNN models, 320x320, Focal Loss",
            "config3": "CNN-Transformer models, 224x224, Focal Loss",
            "config4": "All models, 224x224, Asymmetric Loss"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    engine = get_inference_engine()

    return HealthResponse(
        status="healthy",
        device=engine.device,
        available_configs=list(CONFIG_SETTINGS.keys()),
        available_models=list(MODEL_FILENAME_MAP.keys())
    )

@app.get("/models", response_model=Dict[str, ConfigInfo])
async def list_models():
    """List all available models grouped by configuration"""
    engine = get_inference_engine()
    available = engine.get_available_models()

    # Convert to proper response format
    response = {}
    for config, info in available.items():
        response[config] = ConfigInfo(
            image_size=info['image_size'],
            loss=info['loss'],
            type=info['type'],
            models=[ModelInfo(**model) for model in info['models']]
        )

    return response

@app.get("/compatibility")
async def get_compatibility():
    return {
        "compatibility_matrix": MODEL_CONFIG_COMPATIBILITY,
        "config_descriptions": {
            "config1": {
                "description": "CNN models with 224x224 input and Focal Loss",
                "compatible_models": ["densenet121", "efficientnet-b2", "regnety-800mf"]
            },
            "config2": {
                "description": "CNN models with 320x320 input and Focal Loss",
                "compatible_models": ["densenet121", "efficientnet-b2", "regnety-800mf"]
            },
            "config3": {
                "description": "CNN-Transformer models with 224x224 input and Focal Loss",
                "compatible_models": ["efficientformerv2-s2", "mobilevit-s"]
            },
            "config4": {
                "description": "All models with 224x224 input and Asymmetric Loss",
                "compatible_models": ["densenet121", "efficientnet-b2", "regnety-800mf", "efficientformerv2-s2", "mobilevit-s"]
            }
        }
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    model: str = Form(...),
    config: str = Form(...)
):
    try:
        # Validate config
        if config not in CONFIG_SETTINGS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid config. Must be one of: {list(CONFIG_SETTINGS.keys())}"
            )

        # Validate model
        if model not in MODEL_FILENAME_MAP:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid model. Must be one of: {list(MODEL_FILENAME_MAP.keys())}"
            )

        # Check compatibility
        engine = get_inference_engine()
        if not engine.check_compatibility(model, config):
            compatible_configs = MODEL_CONFIG_COMPATIBILITY.get(model, [])
            raise HTTPException(
                status_code=400,
                detail=f"Model '{model}' is not compatible with '{config}'. Compatible configs: {compatible_configs}"
            )

        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an image (PNG, JPG, JPEG)"
            )

        # Read image bytes
        image_bytes = await file.read()

        # Run prediction
        result = engine.predict(
            image_input=image_bytes,
            model_name=model,
            config=config,
            diseases=DISEASES
        )

        # Return response
        return PredictionResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "results": [],
                "processing_time": 0.0,
                "model_name": model,
                "config": config,
                "image_size": CONFIG_SETTINGS.get(config, {}).get('image_size', 0),
                "device": "unknown"
            }
        )

@app.post("/clear-cache")
async def clear_cache():
    try:
        engine = get_inference_engine()
        engine.clear_cache()
        return {"message": "Model cache cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/configs")
async def list_configs():
    configs_info = {}
    for config_name, settings in CONFIG_SETTINGS.items():
        configs_info[config_name] = {
            "image_size": settings['image_size'],
            "learning_rate": settings['learning_rate'],
            "loss_function": settings['loss'],
            "model_type": settings['type'],
            "description": f"{settings['type']}, {settings['image_size']}×{settings['image_size']}, {settings['loss']} Loss, LR={settings['learning_rate']}"
        }

    return {
        "configs": configs_info,
        "note": "Config folders should contain trained model files"
    }

@app.get("/implementation-status")
async def implementation_status():
    engine = get_inference_engine()

    status = {
        "fully_implemented": [],
        "compatible_combinations": [],
        "incompatible_combinations": []
    }

    # Check all combinations
    for config in CONFIG_SETTINGS.keys():
        config_dir = MODELS_DIR / config

        for model in MODEL_FILENAME_MAP.keys():
            model_path = config_dir / MODEL_FILENAME_MAP[model]
            is_compatible = engine.check_compatibility(model, config)
            file_exists = model_path.exists()

            combo_info = {
                "model": model,
                "config": config,
                "compatible": is_compatible,
                "file_exists": file_exists
            }

            if is_compatible and file_exists:
                combo_info["status"] = "✓ Ready for inference"
                status["fully_implemented"].append(combo_info)
            elif is_compatible and not file_exists:
                combo_info["status"] = "⚠ Compatible but model file missing"
                combo_info["action"] = f"Train model and save to {model_path}"
                status["compatible_combinations"].append(combo_info)
            else:
                combo_info["status"] = "✗ Incompatible combination"
                combo_info["reason"] = f"{model} cannot be used with {config}"
                status["incompatible_combinations"].append(combo_info)

    return status

if __name__ == "__main__":
    print("=" * 80)
    print("ChestXray AI Diagnostics API v3.0")
    print("=" * 80)
    print("\nSupported Configurations:")
    print("  • config1: CNN models (DenseNet121, EfficientNet-B2, RegNetY-800MF)")
    print("            224×224, Focal Loss, LR=1e-4")
    print("  • config2: CNN models (DenseNet121, EfficientNet-B2, RegNetY-800MF)")
    print("            320×320, Focal Loss, LR=3e-4")
    print("  • config3: Transformer models (EfficientFormerV2-S2, MobileViT-S)")
    print("            224×224, Focal Loss, LR=1e-4")
    print("  • config4: All models (CNN + Transformer)")
    print("            224×224, Asymmetric Loss, LR=1e-4")
    print("=" * 80)
    
    uvicorn.run(
        "backend.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )