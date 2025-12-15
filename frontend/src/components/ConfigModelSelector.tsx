import React from 'react';
import { Settings, Cpu, Layers } from 'lucide-react';

interface Config {
  id: string;
  name: string;
  description: string;
  imgSize: number;
  learningRate: number;
}

interface Model {
  id: string;
  name: string;
}

interface ConfigModelSelectorProps {
  config: string;
  model: string;
  configs: Config[];
  models: Model[]; // Now receives config-specific models
  onChangeConfig: (value: string) => void;
  onChangeModel: (value: string) => void;
}

export function ConfigModelSelector({
                                      config,
                                      model,
                                      configs,
                                      models, // Config-specific models
                                      onChangeConfig,
                                      onChangeModel,
                                    }: ConfigModelSelectorProps) {
  const selectedConfig = configs.find(c => c.id === config);
  const selectedModel = models.find(m => m.id === model);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Chọn cấu hình và model</h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">

        {/* Config Selection - First */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Layers className="w-4 h-4 text-purple-600" />
            Cấu hình
          </label>
          <select
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white cursor-pointer"
            value={config}
            onChange={(e) => onChangeConfig(e.target.value)}
          >
            {configs.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {selectedConfig && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Image Size:</span>
                <span className="font-semibold text-gray-900 bg-purple-50 px-3 py-1 rounded-full">
                  {selectedConfig.imgSize}×{selectedConfig.imgSize}px
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Learning Rate:</span>
                <span className="font-semibold text-gray-900 bg-purple-50 px-3 py-1 rounded-full">
                  {selectedConfig.learningRate}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100"></div>

        {/* Model Selection - Second */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Cpu className="w-4 h-4 text-indigo-600" />
            Model
          </label>

          {models.length === 0 ? (
            <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              Không có model nào cho config này
            </div>
          ) : (
            <>
              <select
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white cursor-pointer"
                value={model}
                onChange={(e) => onChangeModel(e.target.value)}
              >
                {models.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

      </div>
    </div>
  );
}