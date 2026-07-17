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
import { getRoute } from '../api/route';
import { getNearestAreas } from '../services/nearestAreaMockService';

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
        const response = await fetch('http://127.0.0.1:5000/api/geo/gathering-areas');
        
        if (!response.ok) {
          throw new Error(`Veri çekilemedi: ${response.statusText}`);
        }

        const geoJsonData = await response.json();

        if (!geoJsonData || !geoJsonData.features) {
          throw new Error("Geçersiz GeoJSON veri yapısı.");
        }

        const mappedAreas = geoJsonData.features.map((feature) => {
          let longitude = null;
          let latitude = null;
          const geom = feature.geometry;

          if (geom) {
            if (geom.type === 'Point') {
              longitude = geom.coordinates[0];
              latitude = geom.coordinates[1];
            } else if (geom.type === 'Polygon' && geom.coordinates[0]) {
              const ring = geom.coordinates[0];
              const sum = ring.reduce((acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]], [0, 0]);
              longitude = sum[0] / ring.length;
              latitude = sum[1] / ring.length;
            } else if (geom.type === 'MultiPolygon' && geom.coordinates[0]?.[0]) {
              const ring = geom.coordinates[0][0];
              const sum = ring.reduce((acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]], [0, 0]);
              longitude = sum[0] / ring.length;
              latitude = sum[1] / ring.length;
            }
          }

          const props = feature.properties || {};
          return {
            id: props.ID || props.OBJECTID || props.id || Math.random(),
            name: props.ADI || props.TOPLANMA_ALANI_ADI || props.name || "Toplanma Alanı",
            district: props.ILCE_ADI || props.ILCE || props.district || "",
            neighborhood: props.MAHALLE_ADI || props.MAHALLE || props.neighborhood || "",
            latitude: latitude !== null ? Number(latitude) : null,
            longitude: longitude !== null ? Number(longitude) : null,
            capacity: props.KAPASITE || props.KAPASITESI || 0,
            availability: 'available',
            type: props.TURU || 'Toplanma Alanı'
          };
        });

        const cleanAreas = mappedAreas.filter(area => area.latitude !== null && area.longitude !== null);
        setAreas(cleanAreas);
      } catch (err) {
        console.error("Toplanma alanları yüklenirken hata:", err);
        setError(err.message);
      }
    };

    fetchAreas();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => console.warn("Kullanıcı konumu alınamadı.", err),
      { enableHighAccuracy: true }
    );
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

  const handleGetLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(location);

        try {
          const nearest = await getNearestAreas(
            location.latitude,
            location.longitude,
          );
          setNearestAreas(nearest);
          setShowNearestPanel(true);
        } catch (err) {
          console.error("En yakın alanlar getirilirken hata oluştu:", err);
        }
      },
      (err) => {
        alert('Konum alınamadı.');
        console.error(err);
      },
      { enableHighAccuracy: true }
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
      <div style={{ padding: '24px', fontFamily: 'sans-serif', color: '#DC2626' }}>
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

        <LocationButton onClick={handleGetLocation} />

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