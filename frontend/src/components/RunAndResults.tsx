import React from 'react';
import { Play, AlertCircle, CheckCircle, XCircle, AlertTriangle, Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface Result {
  disease: string;
  prob: number;
}

interface RunAndResultsProps {
  imageUrl: string | null;
  thresholds: Record<string, number>;
  results: Result[] | null;
  diseases: string[];
  onRun: () => void;
  isProcessing: boolean;
  error?: string | null;
}

export function RunAndResults({
                                imageUrl,
                                thresholds,
                                results,
                                diseases,
                                onRun,
                                isProcessing,
                                error
                              }: RunAndResultsProps) {
  const getResultColor = (prob: number, threshold: number) => {
    if (prob >= threshold) {
      if (prob >= 0.8) return 'bg-red-500 text-white border-red-600';
      if (prob >= 0.6) return 'bg-orange-500 text-white border-orange-600';
      return 'bg-yellow-500 text-white border-yellow-600';
    }
    return 'bg-green-500 text-white border-green-600';
  };

  const getResultIcon = (prob: number, threshold: number) => {
    if (prob >= threshold) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <CheckCircle className="w-4 h-4" />;
  };

  const getRiskLevel = (prob: number) => {
    if (prob >= 0.8) return { label: 'Cao', color: 'text-red-600', bg: 'bg-red-50' };
    if (prob >= 0.6) return { label: 'TB-Cao', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (prob >= 0.4) return { label: 'Trung bình', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (prob >= 0.2) return { label: 'TB-Thấp', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { label: 'Thấp', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const positiveCount = results
    ? results.filter(r => r.prob >= thresholds[r.disease]).length
    : 0;

  const avgConfidence = results
    ? (results.reduce((acc, r) => acc + r.prob, 0) / results.length * 100).toFixed(1)
    : '0.0';

  const highestRisk = results
    ? results.reduce((max, r) => r.prob > max.prob ? r : max, results[0])
    : null;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Kết quả phân tích</h2>
            </div>
          </div>
          <button
            onClick={onRun}
            disabled={!imageUrl || isProcessing}
            className="bg-white text-blue-600 hover:bg-blue-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
          >
            <Play className="w-4 h-4" />
            {isProcessing ? 'Đang xử lý...' : 'Phân tích'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Lỗi xử lý</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!imageUrl && !results && !error && (
          <div className="text-center py-20">
            <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Chưa có ảnh</p>
            <p className="text-sm text-gray-500">
              Vui lòng tải ảnh X-quang lên để bắt đầu phân tích
            </p>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <div className="text-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Đang phân tích...</p>
            <p className="text-sm text-gray-500">AI đang xử lý ảnh X-quang của bạn</p>
          </div>
        )}

        {/* Results */}
        {results && !isProcessing && (
          <div className="space-y-6">

            {/* Disclaimer */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-4">
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong className="font-semibold">⚕️ Lưu ý quan trọng:</strong> Kết quả AI chỉ mang tính tham khảo.
                Vui lòng tham khảo ý kiến bác sĩ chuyên khoa để có chẩn đoán chính xác.
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                <div className="text-xs text-blue-600 font-medium mb-1">Detected</div>
                <div className="text-2xl font-bold text-blue-700">{positiveCount}/{diseases.length}</div>
                <div className="text-xs text-blue-600 mt-1">Diseases</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                <div className="text-xs text-purple-600 font-medium mb-1">Confidence</div>
                <div className="text-2xl font-bold text-purple-700">{avgConfidence}%</div>
                <div className="text-xs text-purple-600 mt-1">Average</div>
              </div>

              {highestRisk && (
                <div className="bg-gradient-to-br from-red-50 to-orange-100 rounded-2xl p-4 border border-red-200">
                  <div className="text-xs text-red-600 font-medium mb-1">Highest</div>
                  <div className="text-2xl font-bold text-red-700">{(highestRisk.prob * 100).toFixed(0)}%</div>
                  <div className="text-xs text-red-600 mt-1 truncate">{highestRisk.disease.replace(/_/g, ' ')}</div>
                </div>
              )}
            </div>

            {/* Results Grid */}
            <div className="space-y-3">
              {results.map((r) => {
                const th = thresholds[r.disease];
                const positive = r.prob >= th;
                const confidence = (r.prob * 100).toFixed(1);
                const risk = getRiskLevel(r.prob);

                return (
                  <div
                    key={r.disease}
                    className="bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${positive ? 'bg-red-100' : 'bg-green-100'}`}>
                          {positive ? (
                            <TrendingUp className={`w-4 h-4 ${positive ? 'text-red-600' : 'text-green-600'}`} />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {r.disease.replace(/_/g, ' ')}
                          </h3>
                          <p className="text-xs text-gray-500">Threshold: {(th * 100).toFixed(0)}%</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${risk.bg} ${risk.color}`}>
                          {risk.label}
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${getResultColor(r.prob, th)} flex items-center gap-1.5`}>
                          {getResultIcon(r.prob, th)}
                          {positive ? 'Positive' : 'Negative'}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Probability</span>
                        <span className="font-bold text-gray-900">{confidence}%</span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            r.prob >= 0.7 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              r.prob >= 0.4 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                                'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                          style={{ width: `${confidence}%` }}
                        />
                        {/* Threshold Marker */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-gray-700"
                          style={{ left: `${th * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}