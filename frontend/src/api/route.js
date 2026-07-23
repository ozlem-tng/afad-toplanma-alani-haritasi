import api from "./index";


export const getRoute = async (
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude,
  travelMode,
) => {
  const response = await api.get('/route', {
    params: {
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
      travelMode,
    },
  });

  return response.data;
};
