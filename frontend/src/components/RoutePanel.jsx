import '../styles/RoutePanel.css';

import { useState } from 'react';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PlaceIcon from '@mui/icons-material/Place';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import IconButton from '@mui/material/IconButton';
import RouteInfo from './RouteInfo';

function RoutePanel({
  open,
  selectedArea,
  routeInfo,
  travelMode,
  onTravelModeChange,
  onClose,

  startPoint,
  onUseCurrentLocation,
  onSelectFromMap,
  onSearchAddress,
  onCreateRoute,
  isLoadingRoute = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const openMenu = Boolean(anchorEl);
  const [collapsed, setCollapsed] = useState(false);
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  if (!open) return null;

  return (
    <div className={`route-panel ${collapsed ? 'route-panel--collapsed' : ''}`}>
      <IconButton
        className="route-panel__collapse-button"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? 'Paneli genişlet' : 'Paneli daralt'}
      >
        {collapsed ? (
          <KeyboardDoubleArrowRightIcon />
        ) : (
          <KeyboardDoubleArrowLeftIcon />
        )}
      </IconButton>
      <div className="route-panel__header">
        <div>
          <span className="route-panel__eyebrow">Yol tarifi</span>
          <h2 className="route-panel__title">Rota Oluştur</h2>
        </div>

        <div className="route-panel__actions">
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Rota panelini kapat"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      {!collapsed && (
        <div className="route-panel__body">
          <div className="route-panel__location-group">
            <span className="route-panel__location-label">Başlangıç</span>

            <button
              type="button"
              className="route-panel__location-card route-panel__location-card--start"
              onClick={handleOpenMenu}
            >
              <span className="route-panel__location-icon route-panel__location-icon--start">
                <MyLocationIcon />
              </span>

              <span className="route-panel__location-content">
                <strong>
                  {startPoint?.label || 'Başlangıç noktası seçin'}
                </strong>

                <small>
                  {startPoint?.description || 'Mevcut konum, harita veya adres'}
                </small>
              </span>

              <KeyboardArrowDownIcon className="route-panel__arrow" />
            </button>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  onUseCurrentLocation();
                }}
              >
                <ListItemIcon>
                  <MyLocationIcon fontSize="small" />
                </ListItemIcon>

                <ListItemText>Mevcut Konum</ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  onSelectFromMap();
                }}
              >
                <ListItemIcon>
                  <MapIcon fontSize="small" />
                </ListItemIcon>

                <ListItemText>Haritadan Seç</ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  onSearchAddress();
                }}
              >
                {' '}
                <ListItemIcon>
                  <SearchIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Adres Ara</ListItemText>
              </MenuItem>
            </Menu>
          </div>

          <div className="route-panel__connector">
            <span />
          </div>

          <div className="route-panel__location-group">
            <span className="route-panel__location-label">Bitiş</span>

            <div className="route-panel__location-card route-panel__location-card--end">
              <span className="route-panel__location-icon route-panel__location-icon--end">
                <PlaceIcon />
              </span>

              <span className="route-panel__location-content">
                <strong>
                  {selectedArea?.name || 'Toplanma alanı seçilmedi'}
                </strong>

                <small>
                  {selectedArea
                    ? `${selectedArea.district || ''}${
                        selectedArea.neighborhood
                          ? ` / ${selectedArea.neighborhood}`
                          : ''
                      }`
                    : 'Haritadan bir toplanma alanı seçiniz'}
                </small>
              </span>
            </div>
          </div>

          <div className="route-panel__divider" />

          <div className="route-panel__section">
            <span className="route-panel__section-title">Ulaşım tercihi</span>

            <div className="route-panel__travel-modes">
              <button
                type="button"
                className={`route-panel__mode-button ${
                  travelMode === 'walking'
                    ? 'route-panel__mode-button--active'
                    : ''
                }`}
                onClick={() => onTravelModeChange('walking')}
              >
                <DirectionsWalkIcon />
                <span>Yaya</span>
              </button>

              <button
                type="button"
                className={`route-panel__mode-button ${
                  travelMode === 'driving'
                    ? 'route-panel__mode-button--active'
                    : ''
                }`}
                onClick={() => onTravelModeChange('driving')}
              >
                <DirectionsCarIcon />
                <span>Araç</span>
              </button>
            </div>
          </div>

          {routeInfo && (
            <RouteInfo routeInfo={routeInfo} travelMode={travelMode} />
          )}
          <button
            type="button"
            className="route-panel__create-button"
            onClick={onCreateRoute}
            disabled={!startPoint || !selectedArea || isLoadingRoute}
          >
            {isLoadingRoute ? (
              <>
                <CircularProgress size={18} color="inherit" thickness={5} />
                <span>Rota Oluşturuluyor...</span>
              </>
            ) : (
              'Rota Oluştur'
            )}
          </button>

          {!startPoint && (
            <div className="route-panel__notice">
              Rota oluşturmak için önce bir başlangıç noktası seçiniz.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RoutePanel;
