const API_BASE_URL = 'http://localhost:8000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new ApiError(response.status, `API request failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`[API Error] GET ${endpoint}:`, error);
      throw error;
    }
  }
};
