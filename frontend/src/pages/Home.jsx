import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import SearchBar from '../components/SearchBar';
import FilterButton from '../components/FilterButton';
import LocationButton from '../components/LocationButton';
import InfoCard from '../components/InfoCard';
import areas from '../mock/ankaraAreas_realistic_mock.json';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterPanel from '../components/FilterPanel';
import AreaCount from '../components/AreaCount';
import { getRoute } from '../api/route';
import { getNearestAreas } from '../services/nearestAreaMockService';
import NearestAreasPanel from '../components/NearestAreasPanel';
import NearestAreasButton from '../components/NearestAreasButton';

function Home() {
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [nearestAreas, setNearestAreas] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNearestPanel, setShowNearestPanel] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const navigate = useNavigate();
  const [showInfoCard, setShowInfoCard] = useState(false);

  const emptyFilters = {
    district: '',
    neighborhood: '',
    type: '',
    capacity: '',
  };
  const [filters, setFilters] = useState(emptyFilters);
  const [tempFilters, setTempFilters] = useState(emptyFilters);
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== '',
  ).length;
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
  };

  const [routeGeometry, setRouteGeometry] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const filteredAreas = areas.filter((area) => {
    const text = searchText.toLowerCase();

    const matchesSearch =
      area.name.toLowerCase().includes(text) ||
      area.district.toLowerCase().includes(text) ||
      area.neighborhood.toLowerCase().includes(text);

    const matchesDistrict =
      !filters.district || area.district === filters.district;

    const matchesNeighborhood =
      !filters.neighborhood || area.neighborhood === filters.neighborhood;

    const matchesType = !filters.type || area.type === filters.type;

    let matchesCapacity = true;

    if (filters.capacity === '0-1000') {
      matchesCapacity = area.capacity <= 1000;
    } else if (filters.capacity === '1000-3000') {
      matchesCapacity = area.capacity > 1000 && area.capacity <= 3000;
    } else if (filters.capacity === '3000+') {
      matchesCapacity = area.capacity > 3000;
    }

    return (
      matchesSearch &&
      matchesDistrict &&
      matchesNeighborhood &&
      matchesType &&
      matchesCapacity
    );
  });

  const activeAreaCount = filteredAreas.filter(
    (area) => area.availability === 'available',
  ).length;

  const findNearestArea = () => {
    if (!userLocation) return;

    let nearest = areas[0];
    let shortestDistance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      nearest.latitude,
      nearest.longitude,
    );

    areas.forEach((area) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        area.latitude,
        area.longitude,
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearest = area;
      }
    });

    setSelectedArea(nearest);
  };

  const handleGetLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(location);

        const nearest = await getNearestAreas(
          location.latitude,
          location.longitude,
        );

        setNearestAreas(nearest);

        // EKLENECEK
        setShowNearestPanel(true);

        console.log('nearest:', nearest);
      },
      (error) => {
        alert('Konum alınamadı.');
        console.error(error);
      },
    );
  };
  const handleSelectArea = (area) => {
    setSelectedArea(area);
    if (area) {
      setShowInfoCard(true);
    } else {
      setShowInfoCard(false);
    }
    // Yeni alan seçildiğinde eski rotayı temizle
    setRouteGeometry(null);
    setRouteInfo(null);
  };

  const handleCreateRoute = async () => {
    if (!userLocation) {
      alert('Rota oluşturmak için önce konumunuzu bulun.');
      return;
    }

    if (!selectedArea) {
      alert('Lütfen bir toplanma alanı seçin.');
      return;
    }

    try {
      setIsLoadingRoute(true);

      const routeResponse = await getRoute(
        userLocation.latitude,
        userLocation.longitude,
        selectedArea.latitude,
        selectedArea.longitude,
      );

      const firstRoute = routeResponse?.routes?.[0];

      if (!firstRoute?.geometry?.coordinates?.length) {
        throw new Error('Backend geçerli bir rota döndürmedi.');
      }

      setRouteGeometry(firstRoute.geometry);

      setRouteInfo({
        distance: firstRoute.distance,
        duration: firstRoute.duration,
      });
    } catch (error) {
      console.error('Rota oluşturulamadı:', error);
      alert('Rota oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoadingRoute(false);
    }
  };
  return (
    <>
      <Navbar onNavigate={() => navigate('/login')} />

      <div style={{ position: 'relative' }}>
        <MapView
          areas={filteredAreas}
          selectedArea={selectedArea}
          onSelectArea={handleSelectArea}
          userLocation={userLocation}
          routeGeometry={routeGeometry}
        />
        {showNearestPanel && (
          <NearestAreasPanel
            nearestAreas={nearestAreas}
            selectedArea={selectedArea}
            onSelectArea={handleSelectArea}
            onClose={() => setShowNearestPanel(false)}
          />
        )}
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          filteredAreas={filteredAreas}
          onSelectArea={handleSelectArea}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
        />
        <NearestAreasButton
          open={showNearestPanel}
          disabled={!userLocation}
          onClick={() => setShowNearestPanel(!showNearestPanel)}
        />
        <FilterButton
          open={filterOpen}
          activeCount={activeFilterCount}
          onClick={() => setFilterOpen(!filterOpen)}
        />
        <FilterPanel
          open={filterOpen}
          areas={areas}
          filters={tempFilters}
          setFilters={setTempFilters}
          onApply={() => {
            setFilters(tempFilters);
            setFilterOpen(false);
          }}
          onClear={() => {
            setTempFilters(emptyFilters);
            setFilters(emptyFilters);
          }}
        />
        <LocationButton onClick={handleGetLocation} />{' '}
        {showInfoCard && selectedArea && (
          <InfoCard
            selectedArea={selectedArea}
            onCreateRoute={handleCreateRoute}
            isLoadingRoute={isLoadingRoute}
            onClose={() => setShowInfoCard(false)}
          />
        )}
      </div>
    </>
  );
}

export default Home;
