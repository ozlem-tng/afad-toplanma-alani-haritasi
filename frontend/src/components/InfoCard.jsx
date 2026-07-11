import { COLORS } from '../styles/colors';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import GroupsIcon from '@mui/icons-material/Groups';
import PlaceIcon from '@mui/icons-material/Place';

function InfoCard({ selectedArea }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 24,
        width: 380,
        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: '20px',
        boxShadow: '0 12px 30px rgba(36,53,83,.15)',
        zIndex: 1000,
      }}
    >
      {!selectedArea ? (
        <>
          <h3
            style={{
              margin: 0,
              marginBottom: 14,
              color: COLORS.primary,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Toplanma Alanı
          </h3>

          <p
            style={{
              margin: 0,
              color: COLORS.textSecondary,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Haritadan bir toplanma alanı seçiniz.
          </p>
        </>
      ) : (
        <>
          <h3
            style={{
              margin: 0,
              marginBottom: 18,
              color: COLORS.primary,
              fontSize: 19,
              fontWeight: 700,
            }}
          >
            {selectedArea.name}
          </h3>

          <InfoRow
            icon={
              <LocationOnIcon sx={{ color: COLORS.primary, fontSize: 20 }} />
            }
            title="İlçe"
            value={selectedArea.district}
          />
          <InfoRow
            icon={<HomeWorkIcon sx={{ color: COLORS.primary, fontSize: 20 }} />}
            title="Mahalle"
            value={selectedArea.neighborhood}
          />
          <InfoRow
            icon={<PlaceIcon sx={{ color: COLORS.primary, fontSize: 20 }} />}
            title="Adres"
            value={selectedArea.address}
          />
          <InfoRow
            icon={<GroupsIcon sx={{ color: COLORS.primary, fontSize: 20 }} />}
            title="Kapasite"
            value={`${selectedArea.capacity} kişi`}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 10,
              paddingTop: 10,
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: COLORS.textPrimary,
              }}
            >
              Durum
            </span>

            <span
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                background:
                  selectedArea.availability === 'available'
                    ? COLORS.secondaryLight
                    : '#FDECEC',
                color:
                  selectedArea.availability === 'available'
                    ? COLORS.secondary
                    : COLORS.danger,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {selectedArea.availability === 'available' ? 'Aktif' : 'Pasif'}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({ icon, title, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 110,
        }}
      >
        {icon}

        <span
          style={{
            color: COLORS.textSecondary,
            fontWeight: 600,
          }}
        >
          {title}
        </span>
      </div>

      <span
        style={{
          color: COLORS.textPrimary,
          fontWeight: 500,
          textAlign: 'right',
          flex: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default InfoCard;
