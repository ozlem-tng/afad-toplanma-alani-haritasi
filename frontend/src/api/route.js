import api from "./index";


export const getRoute = async (
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude,
) => {
  const response = await api.get('/route', {
    params: {
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
    },
  });

  return response.data;
};
