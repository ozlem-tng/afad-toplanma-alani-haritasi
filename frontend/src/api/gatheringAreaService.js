import api from './index';

export const getGatheringAreas = async () => {
  const response = await api.get('/toplanma-alanlari');
  return response.data;
};