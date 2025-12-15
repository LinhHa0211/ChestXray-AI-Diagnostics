import cv2
import numpy as np
import torch
from typing import Union


def letterbox(gray: np.ndarray, size: int = 224, pad_mode: str = "reflect") -> np.ndarray:
    # Tính scale và kích thước mới
    h, w = gray.shape[:2]
    scale = size / max(h, w)
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))

    # Resize ảnh
    interp = cv2.INTER_AREA if scale < 1.0 else cv2.INTER_CUBIC
    resized = cv2.resize(gray, (new_w, new_h), interpolation=interp)

    # Tính padding để thành hình vuông size x size
    pad_w, pad_h = size - new_w, size - new_h
    top, bottom = pad_h // 2, pad_h - pad_h // 2
    left, right = pad_w // 2, pad_w - pad_w // 2

    # Thêm viền (padding)
    if pad_mode == "reflect":
        padded = cv2.copyMakeBorder(resized, top, bottom, left, right, cv2.BORDER_REFLECT_101)
    else:
        raise ValueError("pad_mode must be 'reflect'")

    return padded


def preprocess_image(
    image_path: str,
    size: int = 224,
    pad_mode: str = "reflect"
) -> torch.Tensor:
    # Read image
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")

    # Normalize to uint8 if needed
    if img.dtype != np.uint8:
        img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

    # Convert to grayscale
    if img.ndim == 3 and img.shape[2] == 3:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    elif img.ndim == 2:
        gray = img
    else:
        raise ValueError("Image must be H×W or H×W×3")

    # Apply letterbox resize (same as training)
    padded_gray = letterbox(gray, size=size, pad_mode=pad_mode)

    # Convert to RGB (3 channels) - stack grayscale 3 times
    rgb = np.stack([padded_gray] * 3, axis=2)

    # Normalize to [0, 1] and convert to CHW format
    rgb = (rgb.astype(np.float32) / 255.0).transpose(2, 0, 1).copy()

    # Convert to tensor and add batch dimension
    tensor = torch.from_numpy(rgb).unsqueeze(0)

    return tensor


def preprocess_image_from_bytes(
    image_bytes: bytes,
    size: int = 224,
    pad_mode: str = "reflect"
) -> torch.Tensor:
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

    if img is None:
        raise ValueError("Cannot decode image from bytes")

    # Normalize to uint8 if needed
    if img.dtype != np.uint8:
        img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)

    # Convert to grayscale
    if img.ndim == 3 and img.shape[2] == 3:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    elif img.ndim == 2:
        gray = img
    else:
        raise ValueError("Image must be H×W or H×W×3")

    # Apply letterbox resize
    padded_gray = letterbox(gray, size=size, pad_mode=pad_mode)

    # Convert to RGB (3 channels)
    rgb = np.stack([padded_gray] * 3, axis=2)

    # Normalize to [0, 1] and convert to CHW format
    rgb = (rgb.astype(np.float32) / 255.0).transpose(2, 0, 1).copy()

    # Convert to tensor and add batch dimension
    tensor = torch.from_numpy(rgb).unsqueeze(0)

    return tensor