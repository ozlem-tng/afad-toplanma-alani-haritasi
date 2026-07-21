const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || 'Backend isteği başarısız oldu.');
  }

  return response.status === 204 ? null : response.json();
};

export const normalizeGatheringArea = (row) => ({
  recordKey: String(row.id),
  id: row.id,
  name: row.name,
  type: row.alanTur,
  areaSize: Number(row.alanM2) || 0,
  neighborhood: row.mahalleAdi || '',
  district: row.ilceAdi || '',
  capacity: Number(row.kapasite) || 0,
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  availability: 'available',
});

const toApiPayload = (area) => ({
  name: area.name,
  alanTur: area.type,
  alanM2: Number(area.areaSize) || 0,
  mahalleAdi: area.neighborhood || null,
  ilceAdi: area.district || null,
  kapasite: Number(area.capacity) || 0,
  latitude: Number(area.latitude),
  longitude: Number(area.longitude),
});

export const fetchGatheringAreas = async () =>
  (await request('/api/toplanma-alanlari')).map(normalizeGatheringArea);

export const createGatheringArea = async (area) =>
  normalizeGatheringArea(await request('/api/toplanma-alanlari', {
    method: 'POST',
    body: JSON.stringify(toApiPayload(area)),
  }));

export const updateGatheringArea = async (id, area) =>
  normalizeGatheringArea(await request(`/api/toplanma-alanlari/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toApiPayload(area)),
  }));

export const deleteGatheringArea = async (id) =>
  request(`/api/toplanma-alanlari/${id}`, { method: 'DELETE' });

export const restoreGatheringArea = async (id) =>
  normalizeGatheringArea(await request(`/api/toplanma-alanlari/${id}/restore`, {
    method: 'POST',
  }));
