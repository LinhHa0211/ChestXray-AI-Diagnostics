import React from 'react';
import { RotateCcw, Sliders } from 'lucide-react';

interface ThresholdToolbarProps {
  diseases: string[];
  thresholds: Record<string, number>;
  onChangeThreshold: (disease: string, value: number) => void;
  onReset: () => void;
}

export function ThresholdToolbar({
                                   diseases,
                                   thresholds,
                                   onChangeThreshold,
                                   onReset,
                                 }: ThresholdToolbarProps) {
  const handleNumberChange = (disease: string, value: string) => {
    const numValue = Math.min(1, Math.max(0, Number(value) || 0));
    onChangeThreshold(disease, numValue);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden top-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Điều chỉnh ngưỡng phân loại</h2>
            </div>
          </div>
          <button
            onClick={onReset}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {diseases.map((disease, index) => {
            const value = thresholds[disease];
            const percent = (value * 100).toFixed(0);
            const colors = [
              'from-blue-500 to-cyan-500',
              'from-purple-500 to-pink-500',
              'from-green-500 to-emerald-500',
              'from-yellow-500 to-orange-500',
              'from-red-500 to-rose-500',
              'from-indigo-500 to-purple-500',
            ];
            const color = colors[index % colors.length];

            return (
              <div key={disease} className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-800">
                    {disease.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={value}
                      onChange={(e) => handleNumberChange(disease, e.target.value)}
                      className="w-16 border-2 border-gray-200 rounded-lg px-2 py-1 text-xs text-right font-semibold focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    <div className={`
                      bg-gradient-to-r ${color} text-white 
                      px-3 py-1 rounded-lg text-xs font-bold min-w-[50px] text-center
                      shadow-sm
                    `}>
                      {percent}%
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {/* Track */}
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    {/* Progress */}
                    <div
                      className={`h-full bg-gradient-to-r ${color} transition-all duration-300 rounded-full shadow-inner`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Slider */}
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={value}
                    onChange={(e) => onChangeThreshold(disease, Number(e.target.value))}
                    className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
                  />
                </div>

                {/* Markers */}
                <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 px-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}