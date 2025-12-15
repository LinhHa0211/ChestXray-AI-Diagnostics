import React from 'react';
import { Activity, Stethoscope, Brain } from 'lucide-react';

interface HeaderSectionProps {
  diseaseCount: number;
}

export function HeaderSection({ diseaseCount }: HeaderSectionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-2xl">
      <div className="max-w-[1800px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

          {/* Left - Title & Description */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Hệ thống phát hiện đa bệnh lý phổi từ ảnh X-quang ngực với Deep Learning
                </h1>
              </div>
            </div>
            <p className="text-blue-100 text-base max-w-3xl leading-relaxed">
              <span className="block mt-2 text-blue-200 text-sm">
                ⚠️ Chỉ dùng cho mục đích nghiên cứu và hỗ trợ chẩn đoán, không thay thế ý kiến bác sĩ chuyên khoa.
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}