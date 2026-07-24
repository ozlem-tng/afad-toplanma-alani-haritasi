import { COLORS } from '../styles/colors';
import '../styles/InfoCard.css';

import IconButton from '@mui/material/IconButton';

import CloseIcon from '@mui/icons-material/Close';
import DirectionsIcon from '@mui/icons-material/Directions';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PlaceIcon from '@mui/icons-material/Place';
import GroupsIcon from '@mui/icons-material/Groups';

import InfoRow from './InfoRow';

function InfoCard({
  selectedArea,
  routeInfo,
  travelMode,
  onClose,
  onOpenRoutePanel,
}) {
  if (!selectedArea) {
    return (
      <div className="info-card">
        <h3 className="info-card-title">Toplanma Alanı</h3>

        <p className="info-card-empty">Haritadan bir toplanma alanı seçiniz.</p>
      </div>
    );
  }

  return (
    <div className="info-card">
      <IconButton className="info-card-close" onClick={onClose} size="small">
        <CloseIcon fontSize="small" />
      </IconButton>

      <h3 className="info-card-title">{selectedArea.name}</h3>

      <InfoRow
        icon={
          <LocationOnIcon
            sx={{
              color: COLORS.primary,
              fontSize: 20,
            }}
          />
        }
        title={selectedArea.district ? 'İlçe' : 'Alan Türü'}
        value={selectedArea.district || selectedArea.type}
      />

      <InfoRow
        icon={
          <HomeWorkIcon
            sx={{
              color: COLORS.primary,
              fontSize: 20,
            }}
          />
        }
        title={selectedArea.neighborhood ? 'Mahalle' : 'Yüzölçümü'}
        value={
          selectedArea.neighborhood ||
          `${Number(selectedArea.areaSize || 0).toLocaleString('tr-TR')} m²`
        }
      />

      {selectedArea.address && (
        <InfoRow
          icon={
            <PlaceIcon
              sx={{
                color: COLORS.primary,
                fontSize: 20,
              }}
            />
          }
          title="Adres"
          value={selectedArea.address}
        />
      )}

      <InfoRow
        icon={
          <GroupsIcon
            sx={{
              color: COLORS.primary,
              fontSize: 20,
            }}
          />
        }
        title="Kapasite"
        value={`${selectedArea.capacity} kişi`}
      />

      <div className="status-row">
        <span className="status-title">Durum</span>

        <span
          className={`status-badge ${
            selectedArea.availability === 'available' ? 'active' : 'passive'
          }`}
        >
          {selectedArea.availability === 'available' ? 'Aktif' : 'Pasif'}
        </span>
      </div>

      <button className="route-button" onClick={onOpenRoutePanel}>
        <DirectionsIcon fontSize="small" />
        Rota Oluştur
      </button>

    </div>
  );
}

export default InfoCard;
