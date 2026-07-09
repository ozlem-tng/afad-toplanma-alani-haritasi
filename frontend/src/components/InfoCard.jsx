function InfoCard({ selectedArea }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 24,
        width: 340,
        background: '#fff',
        padding: '18px 20px',
        borderRadius: 16,
        boxShadow: '0 10px 30px rgba(10,54,117,.12)',
        zIndex: 1000,
      }}
    >
      {!selectedArea ? (
        <>
          <h3
            style={{
              margin: 0,
              marginBottom: 12,
              color: '#0a3675',
            }}
          >
            Toplanma Alanı
          </h3>

          <p
            style={{
              color: '#64748b',
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
              marginBottom: 12,
              color: '#0a3675',
            }}
          >
            {selectedArea.name}
          </h3>

          <p>
            <b>İlçe:</b> {selectedArea.district}
          </p>

          <p>
            <b>Mahalle:</b> {selectedArea.neighborhood}
          </p>

          <p>
            <b>Adres:</b> {selectedArea.address}
          </p>

          <p>
            <b>Kapasite:</b> {selectedArea.capacity} kişi
          </p>

          <p>
            <b>Durum:</b>{' '}
            <span
              style={{
                color:
                  selectedArea.availability === 'available'
                    ? '#16a34a'
                    : '#dc2626',
                fontWeight: 600,
              }}
            >
              {selectedArea.availability === 'available' ? 'Aktif' : 'Pasif'}
            </span>
          </p>
        </>
      )}
    </div>
  );
}

export default InfoCard;
