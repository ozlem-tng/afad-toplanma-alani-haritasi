import { useEffect, useState } from 'react';
import { fetchActivityLogs } from '../api/activityLogs';
import '../styles/ActivityPage.css';

const activityConfig = {
  ALAN_EKLENDI: { label: 'Alan eklendi', icon: 'pi-plus', className: 'added' },
  ALAN_GUNCELLENDI: { label: 'Alan düzenlendi', icon: 'pi-pencil', className: 'updated' },
  ALAN_SILINDI: { label: 'Alan silindi', icon: 'pi-trash', className: 'deleted' },
  ALAN_GERI_ALINDI: { label: 'Silme geri alındı', icon: 'pi-undo', className: 'added' },
  ADAY_KABUL_EDILDI: { label: 'Aday kabul edildi', icon: 'pi-check', className: 'added' },
  ADAY_REDDEDILDI: { label: 'Aday reddedildi', icon: 'pi-times', className: 'deleted' },
};

function ActivityPage({ onShowOnMap, onUndoDelete }) {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivityLogs()
      .then(setActivities)
      .catch((requestError) => setError(requestError.message));
  }, []);

  const activityCounts = activities.reduce((counts, activity) => {
    if (activity.islemTuru === 'ALAN_EKLENDI' || activity.islemTuru === 'ADAY_KABUL_EDILDI') counts.added += 1;
    else if (activity.islemTuru === 'ALAN_SILINDI' || activity.islemTuru === 'ADAY_REDDEDILDI') counts.deleted += 1;
    else counts.updated += 1;
    return counts;
  }, { added: 0, updated: 0, deleted: 0 });

  return (
    <section className="act-page">
      <div className="act-summary-grid">
        <article className="all"><i className="pi pi-list" /><span><small>Tüm işlemler</small><strong>{activities.length}</strong></span></article>
        <article className="added"><i className="pi pi-plus" /><span><small>Eklenen / kabul</small><strong>{activityCounts.added}</strong></span></article>
        <article className="updated"><i className="pi pi-pencil" /><span><small>Düzenlenen</small><strong>{activityCounts.updated}</strong></span></article>
        <article className="deleted"><i className="pi pi-trash" /><span><small>Silinen / ret</small><strong>{activityCounts.deleted}</strong></span></article>
      </div>

      {error ? <div className="act-empty"><strong>{error}</strong></div> : activities.length === 0 ? (
        <div className="act-empty"><i className="pi pi-history" /><strong>Henüz işlem yapılmadı</strong></div>
      ) : (
        <div className="act-list">
          {activities.map((activity) => {
            const config = activityConfig[activity.islemTuru] || { label: activity.islemTuru, icon: 'pi-history', className: 'updated' };
            const area = activity.yeniDegerler || activity.eskiDegerler || {};
            return (
              <article className="act-item" key={activity.id}>
                <span className={`act-icon ${config.className}`}><i className={`pi ${config.icon}`} /></span>
                <div className="act-copy">
                  <div><strong>{area.name || `Kayıt #${activity.toplanmaAlaniId || activity.adayNoktaId}`}</strong><span className={`act-badge ${config.className}`}>{config.label}</span></div>
                  <p>{area.alanTur || 'Tür belirtilmemiş'} · ID: {area.id || activity.toplanmaAlaniId || activity.adayNoktaId}</p>
                </div>
                <time dateTime={activity.islemTarihi}><i className="pi pi-calendar" />{new Date(activity.islemTarihi).toLocaleString('tr-TR')}</time>
                {activity.islemTuru === 'ALAN_SILINDI' ? (
                  <button type="button" className="act-undo-button" onClick={() => onUndoDelete(activity)}><i className="pi pi-undo" /> Geri Al</button>
                ) : activity.toplanmaAlaniId && area.latitude != null ? (
                  <button type="button" className="act-map-button" onClick={() => onShowOnMap({ ...area, type: area.alanTur, areaSize: area.alanM2, capacity: area.kapasite, recordKey: String(activity.toplanmaAlaniId) })}><i className="pi pi-map-marker" /> Haritada göster</button>
                ) : <span className="act-action-placeholder">—</span>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ActivityPage;
