import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';

import WhatshotIcon from '@mui/icons-material/Whatshot';

function AnalysisButton({ showHeatmap, onClick }) {
  return (
    <Tooltip title="Isı Haritası" placement="left">
      <Fab
        color={showHeatmap ? 'error' : 'primary'}
        onClick={onClick}
        sx={{
          position: 'absolute',
          bottom: 170,
          right: 24,
          zIndex: 1200,
        }}
      >
        <WhatshotIcon />
      </Fab>
    </Tooltip>
  );
}

export default AnalysisButton;