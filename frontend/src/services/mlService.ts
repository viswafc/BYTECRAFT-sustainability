import { apiClient } from './apiClient'
import type { ModelHealth, ModelInfo, PredictResponse, SensorReadingInput } from '../types/api'

export const mlService = {
  models: (signal?: AbortSignal) => apiClient.get<ModelInfo[]>('/api/ml/models', { signal }),
  health: (signal?: AbortSignal) => apiClient.get<ModelHealth>('/api/ml/health', { signal }),
  predict: (readings: SensorReadingInput[], modelName?: string) =>
    apiClient.post<PredictResponse>('/api/ml/predict', { readings, model_name: modelName }),
}
