// src/api/geo.js
export const fetchGatheringAreas = async () => {
  const response = await fetch('http://localhost:5000/api/geo/gathering-areas');
  if (!response.ok) {
    throw new Error('Failed to fetch gathering areas from backend.');
  }
  return await response.json();
};