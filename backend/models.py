import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models
import timm


class ImagenetNormalize(nn.Module):
    def __init__(self):
        super().__init__()
        m = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1)
        s = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1)
        self.register_buffer("mean", m)
        self.register_buffer("std", s)

    def forward(self, x):
        return (x - self.mean) / self.std


class DenseNet121MultiLabel(nn.Module):
    def __init__(self, num_classes: int = 6, pretrained: bool = False, dropout: float = 0.3):
        super().__init__()
        self.norm = ImagenetNormalize()
        self.backbone = models.densenet121(
            weights=models.DenseNet121_Weights.IMAGENET1K_V1 if pretrained else None
        )

        in_features = self.backbone.classifier.in_features
        self.features = self.backbone.features
        self.relu = nn.ReLU(inplace=True)
        self.avgpool = nn.AdaptiveAvgPool2d(1)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(in_features, num_classes)

    def forward(self, x):
        x = self.norm(x)
        features = self.features(x)
        x = self.relu(features)
        x = self.avgpool(x)
        x = x.view(x.size(0), -1)
        x = self.dropout(x)
        logits = self.classifier(x)
        return logits


class EfficientNetB2MultiLabel(nn.Module):
    def __init__(self, num_classes: int = 6, pretrained: bool = False, dropout: float = 0.3):
        super().__init__()
        self.norm = ImagenetNormalize()
        self.backbone = models.efficientnet_b2(
            weights=models.EfficientNet_B2_Weights.IMAGENET1K_V1 if pretrained else None
        )
        self.features = self.backbone.features
        in_features = (
            self.backbone.classifier[-1].in_features
            if isinstance(self.backbone.classifier, nn.Sequential)
            else self.backbone.classifier.in_features
        )
        self.avgpool = nn.AdaptiveAvgPool2d(1)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(in_features, num_classes)

    def forward(self, x):
        x = self.norm(x)
        x = self.features(x)
        x = self.avgpool(x)
        x = x.view(x.size(0), -1)
        x = self.dropout(x)
        logits = self.classifier(x)
        return logits


class RegNetY800MFMultiLabel(nn.Module):
    def __init__(self, num_classes: int = 6, pretrained: bool = False, dropout: float = 0.2):
        super().__init__()
        self.norm = ImagenetNormalize()
        self.backbone = models.regnet_y_800mf(
            weights=models.RegNet_Y_800MF_Weights.IMAGENET1K_V2 if pretrained else None
        )
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(in_features, num_classes)

    def forward(self, x):
        x = self.norm(x)
        x = self.backbone(x)
        x = self.dropout(x)
        logits = self.classifier(x)
        return logits


class EfficientFormerV2S2MultiLabel(nn.Module):
    def __init__(self, num_classes: int = 6, pretrained: bool = False, dropout: float = 0.3, img_size: int = 224):
        super().__init__()
        self.img_size = img_size
        self.backbone = timm.create_model(
            'efficientformerv2_s2',
            pretrained=pretrained,
            num_classes=0,   # no classification head
            global_pool='',  # no global pool
            img_size=img_size,
        )
        # Number of features from backbone (768 for S2)
        self.num_features = self.backbone.num_features

        # Custom head
        self.pooling = nn.AdaptiveAvgPool2d(1)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(self.num_features, num_classes)

    def forward(self, x):
        # Ensure spatial size matches the model config
        if x.shape[-2] != self.img_size or x.shape[-1] != self.img_size:
            x = F.interpolate(
                x,
                size=(self.img_size, self.img_size),
                mode='bilinear',
                align_corners=False,
            )

        # EfficientFormerV2 already includes its own normalization
        features = self.backbone(x)    # [B, C, H, W]
        x = self.pooling(features)     # [B, C, 1, 1]
        x = x.flatten(1)               # [B, C]
        x = self.dropout(x)
        logits = self.classifier(x)    # [B, num_classes]
        return logits


class MobileViTSMultiLabel(nn.Module):
    def __init__(self, num_classes: int = 6, pretrained: bool = False, dropout: float = 0.3):
        super().__init__()
        # Try different MobileViT variants available in timm
        model_variants = [
            'mobilevitv2_100',       # MobileViTv2
        ]

        backbone = None
        for variant in model_variants:
            try:
                backbone = timm.create_model(
                    variant,
                    pretrained=pretrained,
                    num_classes=0,  # Remove classification head
                    global_pool=''   # Remove global pooling
                )
                print(f"Successfully loaded MobileViT variant: {variant}")
                break
            except Exception as e:
                continue

        if backbone is None:
            raise RuntimeError(
                f"Could not load any MobileViT variant. Available variants: {model_variants}\n"
                f"Please check timm version: pip install timm>=0.9.12"
            )

        self.backbone = backbone

        # Get feature dimension - handle different model structures
        try:
            # Try feature_info (for some timm models)
            self.feature_info = self.backbone.feature_info[-1]
            num_features = self.feature_info['num_chs']
        except:
            # Fallback: get num_features from backbone
            try:
                num_features = self.backbone.num_features
            except:
                # Last resort: forward a dummy tensor to get output channels
                dummy_input = torch.randn(1, 3, 224, 224)
                with torch.no_grad():
                    dummy_out = self.backbone(dummy_input)
                num_features = dummy_out.shape[1]

        # Custom head
        self.global_pool = nn.AdaptiveAvgPool2d(1)
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(num_features, num_classes)

    def forward(self, x):
        # timm expects [0,1] normalized input (handled in preprocessing)
        try:
            features = self.backbone(x)
        except Exception as e:
            raise RuntimeError(f"MobileViT forward failed: {str(e)}")

        # Handle different output shapes
        if features.dim() == 2:
            # Already pooled
            pooled = features
        else:
            # Need to pool
            pooled = self.global_pool(features)
            pooled = pooled.flatten(1)

        pooled = self.dropout(pooled)
        logits = self.classifier(pooled)
        return logits


def get_model(model_name: str, num_classes: int = 6, dropout: float = 0.3, img_size: int = 224):
    models_dict = {
        'densenet121': lambda: DenseNet121MultiLabel(num_classes=num_classes, pretrained=False, dropout=dropout),
        'efficientnet-b2': lambda: EfficientNetB2MultiLabel(num_classes=num_classes, pretrained=False, dropout=dropout),
        'regnety-800mf': lambda: RegNetY800MFMultiLabel(num_classes=num_classes, pretrained=False, dropout=dropout),
        'efficientformerv2-s2': lambda: EfficientFormerV2S2MultiLabel(num_classes=num_classes, pretrained=False, dropout=dropout, img_size=img_size),
        'mobilevit-s': lambda: MobileViTSMultiLabel(num_classes=num_classes, pretrained=False, dropout=dropout)
    }

    if model_name not in models_dict:
        raise ValueError(
            f"Model '{model_name}' not supported. "
            f"Available: {list(models_dict.keys())}"
        )

    return models_dict[model_name]()