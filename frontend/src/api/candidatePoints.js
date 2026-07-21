const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || 'Aday nokta işlemi başarısız oldu.');
  }

  return response.json();
};

const normalizeCandidate = (row) => ({
  id: row.id,
  recordKey: `candidate-${row.id}`,
  name: row.name,
  type: row.alanTur,
  areaSize: Number(row.alanM2) || 0,
  neighborhood: row.mahalleAdi || '',
  district: row.ilceAdi || '',
  capacity: Number(row.kapasite) || 0,
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  isAccepted: row.kabulEdildi,
  createdAt: row.olusturulmaTarihi,
  decidedAt: row.kararTarihi,
  rejectionReason: row.retNedeni,
  gatheringAreaId: row.toplanmaAlaniId,
});

export const fetchCandidatePoints = async () =>
  (await request('/api/aday-noktalar')).map(normalizeCandidate);

export const acceptCandidatePoint = async (id) =>
  normalizeCandidate(await request(`/api/aday-noktalar/${id}/kabul`, { method: 'POST' }));

export const rejectCandidatePoint = async (id, rejectionReason) =>
  normalizeCandidate(await request(`/api/aday-noktalar/${id}/ret`, {
    method: 'POST',
    body: JSON.stringify({ retNedeni: rejectionReason }),
  }));
