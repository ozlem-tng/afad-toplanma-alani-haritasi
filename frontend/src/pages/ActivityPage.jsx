import '../styles/ActivityPage.css';

const activityConfig = {
  added: { label: 'Eklendi', icon: 'pi-plus', className: 'added' },
  updated: { label: 'Düzenlendi', icon: 'pi-pencil', className: 'updated' },
  deleted: { label: 'Silindi', icon: 'pi-trash', className: 'deleted' },
};

function ActivityPage({ activities, onShowOnMap, onUndoDelete }) {
  return (
    <section className="act-page">
      <header className="act-header">
        <div>
          <h2>Son İşlemler</h2>
          <p>Bu admin oturumunda yapılan ekleme, düzenleme ve silme işlemleri.</p>
        </div>
        <span>{activities.length} işlem</span>
      </header>

      {activities.length === 0 ? (
        <div className="act-empty">
          <i className="pi pi-history" />
          <strong>Henüz işlem yapılmadı</strong>
          <span>Alan ekleme, düzenleme ve silme işlemleri burada görünecek.</span>
        </div>
      ) : (
        <div className="act-list">
          {activities.map((activity) => {
            const config = activityConfig[activity.type];
            const statusLabel = activity.undone ? 'Geri alındı' : config.label;
            return (
              <article className="act-item" key={activity.id}>
                <span className={`act-icon ${config.className}`}><i className={`pi ${config.icon}`} /></span>
                <div className="act-copy">
                  <div><strong>{activity.area.name}</strong><span className={`act-badge ${activity.undone ? 'undone' : config.className}`}>{statusLabel}</span></div>
                  <p>{activity.area.type || 'Tür belirtilmemiş'} · ID: {activity.area.id}</p>
                </div>
                <time dateTime={activity.createdAt}>{new Date(activity.createdAt).toLocaleString('tr-TR')}</time>
                {activity.type === 'deleted' && !activity.undone ? (
                  <button type="button" className="act-undo-button" onClick={() => onUndoDelete(activity)}>
                    <i className="pi pi-undo" /> Geri Al
                  </button>
                ) : activity.type !== 'deleted' ? (
                  <button type="button" onClick={() => onShowOnMap(activity.area)}>
                    <i className="pi pi-map-marker" /> Haritada göster
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ActivityPage;
