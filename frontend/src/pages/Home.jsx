import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import SearchBar from '../components/SearchBar';
import FilterButton from '../components/FilterButton';
import LocationButton from '../components/LocationButton';
import InfoCard from '../components/InfoCard';
import FilterPanel from '../components/FilterPanel';
import NearestAreasPanel from '../components/NearestAreasPanel';
import NearestAreasButton from '../components/NearestAreasButton';

import RoutePanel from '../components/RoutePanel';
import { getRoute } from '../api/route';
import { getGatheringAreas } from '../api/gatheringAreaService';

function Home() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [nearestAreas, setNearestAreas] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNearestPanel, setShowNearestPanel] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [travelMode, setTravelMode] = useState('walking');

  const [routePanelOpen, setRoutePanelOpen] = useState(false);

  const [isSelectingStartPoint, setIsSelectingStartPoint] = useState(false);

  const [startPoint, setStartPoint] = useState(null);
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

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areas = await getGatheringAreas();

        const mappedAreas = areas.map((area) => ({
          id: area.id,
          name: area.name,
          district: area.ilceAdi || '',
          neighborhood: area.mahalleAdi || '',
          latitude: area.latitude,
          longitude: area.longitude,
          capacity: area.kapasite,
          availability: 'available',
          type: area.alanTur,
        }));

        setAreas(mappedAreas);
      } catch (err) {
        console.error('Toplanma alanları yüklenirken hata:', err);
        setError(err.message);
      }
    };

    fetchAreas();
  }, []);

  // Filtering Logic
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

  const calculateNearestAreas = (latitude, longitude) => {
    return [...areas]
      .map((area) => {
        const distance = getDistance(
          latitude,
          longitude,
          area.latitude,
          area.longitude,
        );

        return {
          ...area,
          distance: distance * 1000,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
  const handleGetLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(location);

        try {
          const nearest = calculateNearestAreas(
            location.latitude,
            location.longitude,
          );

          setNearestAreas(nearest);
          setShowNearestPanel(true);

          console.log('nearest:', nearest);
        } catch (err) {
          console.error('En yakın alanlar getirilirken hata oluştu:', err);
        }

        setStartPoint({
          type: 'current-location',
          label: 'Mevcut Konum',
          description: `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      },
      (err) => {
        alert('Konum alınamadı.');
        console.error(err);
      },
      { enableHighAccuracy: true },
    );
  };
  const handleSelectArea = (area) => {
    setSelectedArea(area);
    if (area) {
      setShowInfoCard(true);
    } else {
      setShowInfoCard(false);
    }
    setRouteGeometry(null);
    setRouteInfo(null);
  };

  const handleSelectStartPointFromMap = (coordinates) => {
    if (!coordinates) return;

    const { latitude, longitude } = coordinates;

    setStartPoint({
      type: 'map',
      label: 'Haritadan Seçilen Konum',
      description: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      latitude,
      longitude,
    });

    setIsSelectingStartPoint(false);

    // Daha önce çizilmiş bir rota varsa temizle
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

  if (error) {
    return (
      <div
        style={{ padding: '24px', fontFamily: 'sans-serif', color: '#DC2626' }}
      >
        <h3>Harita yüklenirken hata oluştu:</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar onNavigate={() => navigate('/login')} />

      <div style={{ position: 'relative', height: 'calc(100vh - 60px)' }}>
        <MapView
          areas={filteredAreas}
          selectedArea={selectedArea}
          onSelectArea={handleSelectArea}
          userLocation={userLocation}
          routeGeometry={routeGeometry}
          isSelectingStartPoint={isSelectingStartPoint}
          startPoint={startPoint}
          onSelectStartPoint={handleSelectStartPointFromMap}
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
        <RoutePanel
          open={routePanelOpen}
          selectedArea={selectedArea}
          travelMode={travelMode}
          startPoint={startPoint}
          onTravelModeChange={setTravelMode}
          onClose={() => {
            setRoutePanelOpen(false);
            setIsSelectingStartPoint(false);

            if (selectedArea) {
              setShowInfoCard(true);
            }
          }}
          onUseCurrentLocation={handleGetLocation}
          onSelectFromMap={() => {
            setIsSelectingStartPoint(true);
          }}
          onSearchAddress={() => {
            console.log('Adres ara');
          }}
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

        <LocationButton onClick={handleGetLocation} />

        {showInfoCard && selectedArea && (
          <InfoCard
            selectedArea={selectedArea}
            onOpenRoutePanel={() => {
              setShowInfoCard(false);
              setRoutePanelOpen(true);
            }}
            onClose={() => setShowInfoCard(false)}
          />
        )}
      </div>
    </>
  );
}

export default Home;
