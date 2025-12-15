# 🫁 ChestXray AI Diagnostics

<div align="center">

![ChestXray AI](https://img.shields.io/badge/ChestXray-AI-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-teal)
![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Hệ thống phát hiện đa bệnh lý phổi từ ảnh X-quang ngực sử dụng Deep Learning**


</div>

---

## 📋 Tổng quan

ChestXray AI Diagnostics là một hệ thống phân loại đa nhãn (multi-label classification) cho ảnh X-quang ngực, có khả năng phát hiện đồng thời 6 loại bệnh lý phổi phổ biến:

- ✅ **Atelectasis** (Xẹp phổi)
- ✅ **Edema** (Phù phổi)
- ✅ **Lung Opacity** (Tổn thương nhu mô phổi)
- ✅ **Pleural Effusion** (Tràn dịch màng phổi)
- ✅ **Pneumonia** (Viêm phổi)
- ✅ **Pneumothorax** (Tràn khí màng phổi)

### ⚠️ Tuyên bố miễn trừ trách nhiệm

> **LƯU Ý QUAN TRỌNG:** Hệ thống này chỉ dùng cho mục đích nghiên cứu và hỗ trợ chẩn đoán. Kết quả từ AI không thể thay thế ý kiến của bác sĩ chuyên khoa. Vui lòng luôn tham khảo ý kiến chuyên gia y tế để có chẩn đoán chính xác.

---

## ✨ Features

### 🎯 Core Features

- **Multi-label Classification**: Phát hiện đồng thời nhiều bệnh lý trên cùng một ảnh
- **Multiple Architectures**: Hỗ trợ 5 kiến trúc mạng khác nhau
- **Flexible Configurations**: 4 cấu hình huấn luyện với image size và learning rate khác nhau
- **Adjustable Thresholds**: Điều chỉnh ngưỡng phân loại theo từng bệnh lý
- **Real-time Inference**: API inference nhanh với PyTorch + CUDA
- **Modern Web UI**: Giao diện người dùng hiện đại với Next.js và Tailwind CSS

### 🏗️ Architecture Support

| Model |
|-------|
| **DenseNet121** |
| **EfficientNet-B2** |
| **RegNetY-800MF** |
| **EfficientFormerV2-S2** |
| **MobileViT-S** |

### ⚙️ Configuration Options

| Config | Image Size | Learning Rate | Loss | Models Available |
|--------|------------|---------------|------|------------------|
| **Config 1** | 224×224 | 1e-4 | Focal Loss | DenseNet121, EfficientNet-B2, RegNetY-800MF |
| **Config 2** | 320×320 | 3e-4 | Focal Loss | DenseNet121, EfficientNet-B2, RegNetY-800MF |
| **Config 3** | 224×224 | 1e-4 | Focal Loss | EfficientFormerV2-S2, MobileViT-S |
| **Config 4** | 320×320 | 3e-4 | Asymmetric Loss | All models |

---

## 🚀 Quick Start

### Prerequisites

- **Backend**: Python 3.8+, PyTorch 2.0+, CUDA (optional)
- **Frontend**: Node.js 18+, npm/yarn
- **Storage**: ~500MB for model files

### Installation

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/LinhHa0211/ChestXray-AI-Diagnostics.git
cd ChestXray-AI-Diagnostics
```

#### 2️⃣ Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt
```

#### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
# or
yarn install
```

#### 4️⃣ Run Application

**Terminal 1 - Backend:**
```bash
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at: **http://localhost:3000**

API documentation at: **http://localhost:8000/docs**

---

## 📖 Usage

### Web Interface

1. **Select Configuration**: Choose config
2. **Select Model**: Pick from available model architectures
3. **Upload Image**: Drag & drop or click to upload chest X-ray image
4. **Run Analysis**: Click "Chạy phân tích" to get predictions
5. **View Results**: See probability scores and positive/negative classifications

---
### Directory Structure

```
chestxray-ai-diagnostics/
├── frontend/
│   ├── app/
│   │   └── page.tsx                 # Main page
│   ├── components/
│   │   ├── HeaderSection.tsx
│   │   ├── ConfigModelSelector.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── ThresholdToolbar.tsx
│   │   └── RunAndResults.tsx
│   ├── constants/
│   │   └── index.ts                 # App constants
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   └── package.json
│
├── backend/
│   ├── models/
│   │   ├── config1/
│   │   │   └── model.pth
│   │   ├── config2/
│   │   ├── config3/
│   │   └── config4/
│   │
│   ├── models.py                    # Neural network architectures
│   ├── preprocessing.py             # Image preprocessing
│   ├── inference.py                 # Inference engine
│   ├── app.py                       # FastAPI application
│   └── requirements.txt
│
└── README.md
```
---

<div align="center">

**⭐ Star this repo if you find it helpful!**

</div>
