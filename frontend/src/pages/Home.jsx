import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import SearchBar from '../components/SearchBar';
import FilterButton from '../components/FilterButton';
import LocationButton from '../components/LocationButton';
import InfoCard from '../components/InfoCard';
import MenuSidebar from '../components/MenuSidebar';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home({ onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Navbar onNavigate={() => navigate('/login')} />

      <div style={{ position: 'relative' }}>
        <MapView />

        <SearchBar onMenuClick={() => setMenuOpen(!menuOpen)} />
        <MenuSidebar open={menuOpen} />
        <FilterButton />
        <LocationButton />
        <InfoCard />
      </div>
    </>
  );
}

export default Home;
