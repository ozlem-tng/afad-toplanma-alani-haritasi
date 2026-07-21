const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const fetchActivityLogs = async (limit = 50) => {
  const response = await fetch(`${API_BASE_URL}/api/islem-gecmisi?limit=${limit}`);

  if (!response.ok) throw new Error('İşlem geçmişi alınamadı.');
  return response.json();
};
