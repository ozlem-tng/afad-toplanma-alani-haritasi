import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import SearchBar from '../components/SearchBar';
import FilterButton from '../components/FilterButton';
import LocationButton from '../components/LocationButton';
import InfoCard from '../components/InfoCard';
import { useState } from 'react';
import MenuSidebar from './components/MenuSidebar';

function Home({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <Navbar onNavigate={onNavigate} />

      <div style={{ position: 'relative' }}>
        <MapView />

        <SearchBar onMenuClick={() => setMenuOpen(!menuOpen)} />
        <Sidebar open={sidebarOpen} />
        <FilterButton />
        <LocationButton />
        <InfoCard />
      </div>
    </>
  );
}

export default Home;
