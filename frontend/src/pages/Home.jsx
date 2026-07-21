import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import SearchBar from '../components/SearchBar';
import FilterButton from '../components/FilterButton';
import LocationButton from '../components/LocationButton';
import InfoCard from '../components/InfoCard';
import FilterPanel from '../components/FilterPanel';
import RoutePanel from '../components/RoutePanel';
import NearestAreasPanel from '../components/NearestAreasPanel';
import NearestAreasButton from '../components/NearestAreasButton';
import AdminLayout from '../components/AdminLayout';
import AddAreaDialog from '../components/AddAreaDialog';
import AreaListPage from './AreaListPage';
import AnalyticsPage from './AnalyticsPage';
import ActivityPage from './ActivityPage';
import { getRoute } from '../api/route';
import { fetchGatheringAreas } from '../api/toplanmaAlanlari';
import { getNearestAreas } from '../services/nearestAreaService';

function Home({ adminMode = false, areas = [] }) {
  const navigate = useNavigate();
  const [geoAreas, setGeoAreas] = useState(areas);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [areasError, setAreasError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [nearestAreas, setNearestAreas] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [isSelectingStartPoint, setIsSelectingStartPoint] = useState(false);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [travelMode, setTravelMode] = useState('walking');
  const [routePanelOpen, setRoutePanelOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNearestPanel, setShowNearestPanel] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [adminPage, setAdminPage] = useState('dashboard');
  const [adminActivities, setAdminActivities] = useState([]);
  const [addAreaDialogOpen, setAddAreaDialogOpen] = useState(false);

  const emptyFilters = {
    district: '',
    neighborhood: '',
    type: '',
    capacity: '',
  };
  const [filters, setFilters] = useState(emptyFilters);
  const [tempFilters, setTempFilters] = useState(emptyFilters);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingAreas(true);
    setAreasError('');

    fetchGatheringAreas()
      .then((result) => {
        if (!cancelled) setGeoAreas(result);
      })
      .catch((error) => {
        console.error('GeoData yüklenemedi:', error);
        if (!cancelled) {
          setAreasError('GeoData yüklenemedi. Backend bağlantısını kontrol edin.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAreas(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adminMode]);

  const visibleAreas = geoAreas;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const areaTypes = [...new Set(geoAreas.map((area) => area.type).filter(Boolean))]
    .sort((first, second) => first.localeCompare(second, 'tr'));

  const addActivity = (type, area) => {
    setAdminActivities((current) => [{
      id: `${Date.now()}-${Math.random()}`,
      type,
      area: { ...area },
      createdAt: new Date().toISOString(),
    }, ...current].slice(0, 50));
  };

  const showAreaOnAdminMap = (area) => {
    setSelectedArea(area);
    setShowInfoCard(true);
    setRoutePanelOpen(false);
    setRouteGeometry(null);
    setAdminPage('dashboard');
  };

  const handleDeleteArea = (area) => {
    setGeoAreas((current) => current.filter(
      (item) => item.recordKey !== area.recordKey,
    ));
    addActivity('deleted', area);
  };

  const handleUndoDelete = (activity) => {
    setGeoAreas((current) => current.some(
      (area) => area.recordKey === activity.area.recordKey,
    ) ? current : [...current, activity.area]);
    setAdminActivities((current) => current.map((item) =>
      item.id === activity.id ? { ...item, undone: true } : item,
    ));
  };

  const handleAddArea = (newArea) => {
    const nextId = geoAreas.reduce(
      (maximum, area) => Math.max(maximum, Number(area.id) || 0),
      0,
    ) + 1;
    const savedArea = {
      ...newArea,
      recordKey: `admin-${Date.now()}-${nextId}`,
      id: nextId,
      poiId: null,
      distance: 0,
      walkingMinutes: 0,
      slopeDegree: null,
      slopePercent: null,
      district: '',
      neighborhood: '',
      address: '',
      availability: 'available',
    };

    setGeoAreas((current) => [...current, savedArea]);
    addActivity('added', savedArea);
    setAddAreaDialogOpen(false);
    setAdminPage('list');
  };

  const filteredAreas = visibleAreas.filter((area) => {
    const text = searchText.toLocaleLowerCase('tr-TR');
    const matchesSearch =
      area.name?.toLocaleLowerCase('tr-TR').includes(text) ||
      area.district?.toLocaleLowerCase('tr-TR').includes(text) ||
      area.neighborhood?.toLocaleLowerCase('tr-TR').includes(text);
    const matchesDistrict = !filters.district || area.district === filters.district;
    const matchesNeighborhood = !filters.neighborhood || area.neighborhood === filters.neighborhood;
    const matchesType = !filters.type || area.type === filters.type;

    let matchesCapacity = true;
    if (filters.capacity === '0-1000') {
      matchesCapacity = area.capacity <= 1000;
    } else if (filters.capacity === '1000-3000') {
      matchesCapacity = area.capacity > 1000 && area.capacity <= 3000;
    } else if (filters.capacity === '3000+') {
      matchesCapacity = area.capacity > 3000;
    }

    return matchesSearch && matchesDistrict && matchesNeighborhood &&
      matchesType && matchesCapacity;
  });

  const handleUseCurrentLocation = ({ openNearestPanel = false } = {}) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);
        setStartPoint({
          ...location,
          label: 'Mevcut konum',
          description: 'Cihazınızdan alınan konum',
        });
        setIsSelectingStartPoint(false);
        setRouteGeometry(null);

        if (openNearestPanel) {
          setNearestAreas(getNearestAreas(
            visibleAreas,
            location.latitude,
            location.longitude,
          ));
          setShowNearestPanel(true);
        }
      },
      (error) => {
        alert('Konum alınamadı. Tarayıcı konum iznini kontrol edin.');
        console.error(error);
      },
      { enableHighAccuracy: true },
    );
  };

  const handleSelectArea = (area) => {
    setSelectedArea(area);
    setShowInfoCard(Boolean(area));
    setRoutePanelOpen(false);
    setRouteGeometry(null);
  };

  const handleSelectStartPoint = ({ latitude, longitude }) => {
    setStartPoint({
      latitude,
      longitude,
      label: 'Haritadan seçilen nokta',
      description: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    });
    setIsSelectingStartPoint(false);
    setRouteGeometry(null);
  };

  const handleCreateRoute = async () => {
    if (!startPoint || !selectedArea) return;

    try {
      setIsLoadingRoute(true);
      const routeResponse = await getRoute(
        startPoint.latitude,
        startPoint.longitude,
        selectedArea.latitude,
        selectedArea.longitude,
      );
      const firstRoute = routeResponse?.routes?.[0];
      if (!firstRoute?.geometry?.coordinates?.length) {
        throw new Error('Backend geçerli bir rota döndürmedi.');
      }
      setRouteGeometry(firstRoute.geometry);
      setRoutePanelOpen(false);
    } catch (error) {
      console.error('Rota oluşturulamadı:', error);
      alert('Rota oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const mapContent = (
    <div style={{
      position: 'relative',
      height: adminMode ? '100%' : 'auto',
      minHeight: adminMode ? 0 : undefined,
    }}>
      <MapView
        areas={filteredAreas}
        selectedArea={selectedArea}
        onSelectArea={handleSelectArea}
        userLocation={userLocation}
        startPoint={startPoint}
        isSelectingStartPoint={isSelectingStartPoint}
        onSelectStartPoint={handleSelectStartPoint}
        routeGeometry={routeGeometry}
        height={adminMode ? '100%' : 'calc(100vh - 76px)'}
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
        areas={visibleAreas}
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
      <LocationButton onClick={() => handleUseCurrentLocation({ openNearestPanel: true })} />

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

      <RoutePanel
        open={routePanelOpen}
        selectedArea={selectedArea}
        travelMode={travelMode}
        onTravelModeChange={setTravelMode}
        startPoint={startPoint}
        onUseCurrentLocation={() => handleUseCurrentLocation()}
        onSelectFromMap={() => setIsSelectingStartPoint(true)}
        onSearchAddress={() => alert('Adres arama özelliği henüz kullanıma hazır değil.')}
        onCreateRoute={handleCreateRoute}
        isLoadingRoute={isLoadingRoute}
        onClose={() => {
          setRoutePanelOpen(false);
          setIsSelectingStartPoint(false);
        }}
      />
    </div>
  );

  if (adminMode) {
    return (
      <AdminLayout
        activePage={adminPage}
        pageTitle={
          adminPage === 'list'
            ? 'Toplanma Alanı Listesi'
            : adminPage === 'stats'
              ? 'Analizler & İstatistikler'
              : adminPage === 'activity'
                ? 'Son İşlemler'
                : 'Yönetici Paneli'
        }
        onNavigate={setAdminPage}
        headerAction={adminPage === 'list' ? (
          <Button
            className="alp-add-button"
            label="Yeni Toplanma Alanı"
            icon="pi pi-plus"
            onClick={() => setAddAreaDialogOpen(true)}
          />
        ) : null}
        onLogout={() => {
          localStorage.removeItem('adminUser');
          navigate('/', { replace: true });
        }}
      >
        {isLoadingAreas
          ? <p>GeoData yükleniyor...</p>
          : areasError
            ? <p role="alert">{areasError}</p>
            : adminPage === 'list'
              ? <AreaListPage areas={geoAreas} setAreas={setGeoAreas} onActivity={addActivity} onShowOnMap={showAreaOnAdminMap} onDelete={handleDeleteArea} />
              : adminPage === 'stats'
                ? <AnalyticsPage areas={geoAreas} />
                : adminPage === 'activity'
                  ? <ActivityPage activities={adminActivities} onShowOnMap={showAreaOnAdminMap} onUndoDelete={handleUndoDelete} />
                  : mapContent}
        <AddAreaDialog
          visible={addAreaDialogOpen}
          areaTypes={areaTypes}
          onHide={() => setAddAreaDialogOpen(false)}
          onSave={handleAddArea}
        />
      </AdminLayout>
    );
  }

  if (isLoadingAreas) return <><Navbar /><p>GeoData yükleniyor...</p></>;
  if (areasError) return <><Navbar /><p role="alert">{areasError}</p></>;

  return (
    <>
      <Navbar onNavigate={() => navigate('/login')} />
      {mapContent}
    </>
  );
}

export default Home;
