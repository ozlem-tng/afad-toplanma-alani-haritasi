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

const normalizeGatheringArea = (area) => ({
  id: area.id,
  name: area.name,
  latitude: area.latitude,
  longitude: area.longitude,
  district: area.ilceAdi,
  neighborhood: area.mahalleAdi,
  type: area.alanTur,
  capacity: area.kapasite,
  availability: 'available',
  areaSize: area.alanM2,
  geometry: area.geometry,
  recordKey: String(area.id),
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
