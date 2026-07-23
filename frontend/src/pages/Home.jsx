import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
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
import CandidatePointsPage from './CandidatePointsPage';
import { getRoute } from '../api/route';
import {
  createGatheringArea,
  deleteGatheringArea,
  fetchGatheringAreas,
  restoreGatheringArea,
  updateGatheringArea,
} from '../api/toplanmaAlanlari';
import { getNearestAreas } from '../services/nearestAreaService';
import AnalysisButton from '../components/AnalysisButton';

function Home({ adminMode = false, areas = [] }) {
  const navigate = useNavigate();
  const adminToast = useRef(null);
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
  const [addAreaDialogOpen, setAddAreaDialogOpen] = useState(false);
  const [previewArea, setPreviewArea] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const emptyFilters = {
    district: '',
    neighborhood: '',
    type: '',
    capacity: '',
  };
  const [filters, setFilters] = useState(emptyFilters);
  const [tempFilters, setTempFilters] = useState(emptyFilters);

  const [routeInfo, setRouteInfo] = useState({
    walking: null,
    driving: null,
  });
  const handleToggleHeatmap = () => {
  if (!showHeatmap) {
    // Analiz moduna geçiliyor

    setSelectedArea(null);
    setShowInfoCard(false);

    setRouteGeometry(null);
    setRouteInfo(null);

    setRoutePanelOpen(false);

    setStartPoint(null);

    setIsSelectingStartPoint(false);
  }

  setShowHeatmap((prev) => !prev);
};
  useEffect(() => {
    let cancelled = false;
    setIsLoadingAreas(true);
    setAreasError('');

    fetchGatheringAreas()
      .then((result) => {
        console.log(result);
        if (!cancelled) setGeoAreas(result);
      })
      .catch((error) => {
        console.error('GeoData yüklenemedi:', error);
        if (!cancelled) {
          setAreasError(
            'GeoData yüklenemedi. Backend bağlantısını kontrol edin.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAreas(false);
      });

    return () => {
      cancelled = true;
    };
  }, [adminMode]);

  useEffect(() => {
    if (!routeGeometry) return;
    if (!startPoint || !selectedArea) return;

    createRoute();
  }, [travelMode]);

  useEffect(() => {
    console.log('Selected Area:', selectedArea);
  }, [selectedArea]);

  const visibleAreas =
    previewArea &&
    !geoAreas.some((area) => area.recordKey === previewArea.recordKey)
      ? [...geoAreas, previewArea]
      : geoAreas;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const areaTypes = [
    ...new Set(geoAreas.map((area) => area.type).filter(Boolean)),
  ].sort((first, second) => first.localeCompare(second, 'tr'));

  const showAreaOnAdminMap = (area) => {
    setPreviewArea(area.recordKey?.startsWith('candidate-') ? area : null);
    setSearchText('');
    setFilters(emptyFilters);
    setTempFilters(emptyFilters);
    setSelectedArea(area);
    setShowInfoCard(true);
    setRoutePanelOpen(false);
    setRouteGeometry(null);
    setAdminPage('dashboard');
  };

  const handleDeleteArea = async (area) => {
    await deleteGatheringArea(area.id);
    setGeoAreas((current) =>
      current.filter((item) => item.recordKey !== area.recordKey),
    );
  };

  const handleUndoDelete = async (activity) => {
    try {
      const restored = await restoreGatheringArea(activity.toplanmaAlaniId);
      setGeoAreas((current) =>
        current.some((area) => area.id === restored.id)
          ? current
          : [...current, restored],
      );
      setAdminPage('list');
      adminToast.current?.show({
        severity: 'success',
        summary: 'Alan geri alındı',
        detail: `${restored.name} yeniden listeye ve haritaya eklendi.`,
        life: 4000,
      });
    } catch (error) {
      adminToast.current?.show({
        severity: 'error',
        summary: 'Geri alınamadı',
        detail: error.message,
        life: 4500,
      });
    }
  };

  const handleAddArea = async (newArea) => {
    const savedArea = await createGatheringArea(newArea);
    setGeoAreas((current) => [...current, savedArea]);
    setAddAreaDialogOpen(false);
    setAdminPage('list');
    adminToast.current?.show({
      severity: 'success',
      summary: 'Yeni alan eklendi',
      detail: `${savedArea.name} veritabanına kaydedildi ve haritaya eklendi.`,
      life: 4500,
    });
  };

  const handleUpdateArea = async (area) => {
    const updated = await updateGatheringArea(area.id, area);
    setGeoAreas((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleCandidateAccepted = (candidate) => {
    const areaId = candidate.gatheringAreaId || candidate.id;
    const acceptedArea = {
      ...candidate,
      id: areaId,
      recordKey: String(areaId),
      availability: 'available',
    };
    setGeoAreas((current) =>
      current.some((area) => area.id === areaId)
        ? current
        : [...current, acceptedArea],
    );
    setPreviewArea(null);
  };

  const filteredAreas = visibleAreas.filter((area) => {
    const text = searchText.toLocaleLowerCase('tr-TR');
    const matchesSearch =
      area.name?.toLocaleLowerCase('tr-TR').includes(text) ||
      area.district?.toLocaleLowerCase('tr-TR').includes(text) ||
      area.neighborhood?.toLocaleLowerCase('tr-TR').includes(text);
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
          setNearestAreas(
            getNearestAreas(
              visibleAreas,
              location.latitude,
              location.longitude,
            ),
          );
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

  const createRoute = async () => {
    if (!startPoint || !selectedArea) return;

    try {
      setIsLoadingRoute(true);
      const [walkingResponse, drivingResponse] = await Promise.all([
        getRoute(
          startPoint.latitude,
          startPoint.longitude,
          selectedArea.latitude,
          selectedArea.longitude,
          'walking',
        ),
        getRoute(
          startPoint.latitude,
          startPoint.longitude,
          selectedArea.latitude,
          selectedArea.longitude,
          'driving',
        ),
      ]);

      const walkingRoute = walkingResponse?.routes?.[0];
      const drivingRoute = drivingResponse?.routes?.[0];

      setRouteInfo({
        walking: {
          distance: walkingRoute?.distance ?? 0,
          duration: walkingRoute?.duration ?? 0,
        },
        driving: {
          distance: drivingRoute?.distance ?? 0,
          duration: drivingRoute?.duration ?? 0,
        },
      });

      const firstRoute = travelMode === 'walking' ? walkingRoute : drivingRoute;
      if (!firstRoute?.geometry?.coordinates?.length) {
        throw new Error('Backend geçerli bir rota döndürmedi.');
      }
      setRouteGeometry(firstRoute.geometry);
      //setRoutePanelOpen(false);
    } catch (error) {
      console.error('Rota oluşturulamadı:', error);
      alert('Rota oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const mapContent = (
    <div
      style={{
        position: 'relative',
        height: adminMode ? '100%' : 'auto',
        minHeight: adminMode ? 0 : undefined,
      }}
    >
      <MapView
        areas={filteredAreas}
        selectedArea={selectedArea}
        onSelectArea={handleSelectArea}
        userLocation={userLocation}
        startPoint={startPoint}
        isSelectingStartPoint={isSelectingStartPoint}
        onSelectStartPoint={handleSelectStartPoint}
        routeGeometry={routeGeometry}
        travelMode={travelMode}
        showHeatmap={showHeatmap}
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
      <LocationButton
        onClick={() => handleUseCurrentLocation({ openNearestPanel: true })}
      />

      <AnalysisButton showHeatmap={showHeatmap} onClick={handleToggleHeatmap} />

      {showInfoCard && (
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
        routeInfo={routeInfo}
        onTravelModeChange={setTravelMode}
        startPoint={startPoint}
        onUseCurrentLocation={() => handleUseCurrentLocation()}
        onSelectFromMap={() => setIsSelectingStartPoint(true)}
        onSearchAddress={() =>
          alert('Adres arama özelliği henüz kullanıma hazır değil.')
        }
        onCreateRoute={createRoute}
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
      <>
        <Toast ref={adminToast} position="top-right" baseZIndex={13000} />
        <AdminLayout
          activePage={adminPage}
          pageTitle={
            adminPage === 'list'
              ? 'Toplanma Alanı Listesi'
              : adminPage === 'suggestions'
                ? 'Aday Alan Önerileri'
                : adminPage === 'stats'
                  ? 'Analizler & İstatistikler'
                  : adminPage === 'activity'
                    ? 'Son İşlemler'
                    : 'Yönetici Paneli'
          }
          onNavigate={setAdminPage}
          headerAction={
            adminPage === 'list' ? (
              <Button
                className="alp-add-button"
                label="Yeni Toplanma Alanı"
                icon="pi pi-plus"
                onClick={() => setAddAreaDialogOpen(true)}
              />
            ) : null
          }
          onLogout={() => {
            localStorage.removeItem('adminUser');
            navigate('/', { replace: true });
          }}
        >
          {isLoadingAreas &&
          ['dashboard', 'list', 'stats'].includes(adminPage) ? (
            <p>GeoData yükleniyor...</p>
          ) : areasError &&
            ['dashboard', 'list', 'stats'].includes(adminPage) ? (
            <p role="alert">{areasError}</p>
          ) : adminPage === 'list' ? (
            <AreaListPage
              areas={geoAreas}
              onUpdate={handleUpdateArea}
              onShowOnMap={showAreaOnAdminMap}
              onDelete={handleDeleteArea}
            />
          ) : adminPage === 'suggestions' ? (
            <CandidatePointsPage
              onShowOnMap={showAreaOnAdminMap}
              onAreaAccepted={handleCandidateAccepted}
            />
          ) : adminPage === 'stats' ? (
            <AnalyticsPage areas={geoAreas} />
          ) : adminPage === 'activity' ? (
            <ActivityPage
              onShowOnMap={showAreaOnAdminMap}
              onUndoDelete={handleUndoDelete}
            />
          ) : (
            mapContent
          )}
          <AddAreaDialog
            visible={addAreaDialogOpen}
            areaTypes={areaTypes}
            onHide={() => setAddAreaDialogOpen(false)}
            onSave={handleAddArea}
          />
        </AdminLayout>
      </>
    );
  }

  if (isLoadingAreas)
    return (
      <>
        <Navbar />
        <p>GeoData yükleniyor...</p>
      </>
    );
  if (areasError)
    return (
      <>
        <Navbar />
        <p role="alert">{areasError}</p>
      </>
    );

  return (
    <>
      <Navbar onNavigate={() => navigate('/login')} />
      {mapContent}
    </>
  );
}

export default Home;
