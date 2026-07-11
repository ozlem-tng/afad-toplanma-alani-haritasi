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

function Home() {
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const emptyFilters = {
    district: '',
    neighborhood: '',
    type: '',
    capacity: '',
  };
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [tempFilters, setTempFilters] = useState(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== '',
  ).length;
  const navigate = useNavigate();

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

  return (
    <>
      <Navbar onNavigate={() => navigate('/login')} />

      <div style={{ position: 'relative' }}>
        <MapView
          areas={filteredAreas}
          selectedArea={selectedArea}
          onSelectArea={setSelectedArea}
        />
        <AreaCount count={activeAreaCount} />
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          filteredAreas={filteredAreas}
          onSelectArea={setSelectedArea}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
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
        <LocationButton />
        <InfoCard selectedArea={selectedArea} />
      </div>
    </>
  );
}

export default Home;
