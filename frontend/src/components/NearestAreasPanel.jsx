import '../styles/NearestAreasPanel.css';

import PlaceIcon from '@mui/icons-material/Place';
import StraightenIcon from '@mui/icons-material/Straighten';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

function NearestAreasPanel({
  nearestAreas,
  selectedArea,
  onSelectArea,
  onClose,
}) {
  if (!nearestAreas?.length) return null;

  const formatDistance = (distance) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }

    return `${Math.round(distance)} m`;
  };

  return (
    <div className="nearest-panel">
      <div className="nearest-header">
        <div>
          <h3 className="nearest-title">
            <PlaceIcon fontSize="small" />
            Yakındaki Alanları
          </h3>

          <p className="nearest-subtitle">Konumunuza en yakın 3 aktif alan</p>
        </div>

        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      <div className="nearest-list">
        {nearestAreas.map((area, index) => {
          const isSelected = selectedArea?.id === area.id;

          return (
            <div
              key={area.recordKey || area.id}
              className={`nearest-card ${
                isSelected ? 'nearest-card-active' : ''
              }`}
              onClick={() => onSelectArea(area)}
            >
              <div className="nearest-number">{index + 1}</div>

              <div className="nearest-content">
                <div className="nearest-name">{area.name}</div>

                <div className="nearest-distance">
                  <StraightenIcon fontSize="small" />
                  <span>{formatDistance(area.distance)}</span>
                </div>
              </div>

              <ArrowForwardIosIcon className="nearest-arrow" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NearestAreasPanel;
