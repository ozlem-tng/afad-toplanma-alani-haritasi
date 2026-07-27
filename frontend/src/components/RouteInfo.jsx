import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import StraightenIcon from '@mui/icons-material/Straighten';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RouteIcon from "@mui/icons-material/Route";
import '../styles/InfoCard.css';

function RouteInfo({ routeInfo }) {
  if (!routeInfo) return null;

  const formatDistance = (distance) => {
    if (!distance) return '-';

    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }

    return `${Math.round(distance)} m`;
  };

  const formatDuration = (duration) => {
    if (!duration) return '-';

    const minutes = Math.round(duration / 60);

    if (minutes < 60) {
      return `${minutes} dk`;
    }

    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    return `${hour} sa ${minute} dk`;
  };

  return (
    <div className="route-info-card">
      <div className="route-info-header">
        <RouteIcon fontSize="small" />
        <h4>Rota Bilgileri</h4>
      </div>

      {/* Yaya */}

      <div className="route-info-row">
        <div className="route-info-title">
          <DirectionsWalkIcon fontSize="small" />
          <div>
            <span>Yaya</span>
            <small>Yürüyerek</small>
          </div>
        </div>

        <div className="route-info-values">
          <div>
            <StraightenIcon fontSize="inherit" />
            <span>{formatDistance(routeInfo.walking?.distance)}</span>
          </div>

          <div>
            <AccessTimeIcon fontSize="inherit" />
            <span>{formatDuration(routeInfo.walking?.duration)}</span>
          </div>
        </div>
      </div>

      {/* Araç */}

      <div className="route-info-row">
        <div className="route-info-title">
          <DirectionsCarFilledIcon fontSize="small" />
          <div>
            <span>Araç</span>
            <small>Motorlu taşıt</small>
          </div>
        </div>

        <div className="route-info-values">
          <div>
            <StraightenIcon fontSize="inherit" />
            <span>{formatDistance(routeInfo.driving?.distance)}</span>
          </div>

          <div>
            <AccessTimeIcon fontSize="inherit" />
            <span>{formatDuration(routeInfo.driving?.duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteInfo;
