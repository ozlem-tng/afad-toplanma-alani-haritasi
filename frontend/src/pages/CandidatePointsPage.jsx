import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import {
  acceptCandidatePoint,
  fetchCandidatePoints,
  rejectCandidatePoint,
} from '../api/candidatePoints';
import '../styles/CandidatePointsPage.css';

const filters = [
  { key: 'pending', label: 'Karar Bekleyenler', icon: 'pi-clock' },
  { key: 'accepted', label: 'Kabul Edilenler', icon: 'pi-check-circle' },
  { key: 'rejected', label: 'Reddedilenler', icon: 'pi-times-circle' },
  { key: 'all', label: 'Tüm Kayıtlar', icon: 'pi-list' },
];

const formatNumber = (value, fractionDigits = 0) =>
  Number(value || 0).toLocaleString('tr-TR', { maximumFractionDigits: fractionDigits });

const matchesFilter = (candidate, filter) => {
  if (filter === 'pending') return candidate.isAccepted === null;
  if (filter === 'accepted') return candidate.isAccepted === true;
  if (filter === 'rejected') return candidate.isAccepted === false;
  return true;
};

function CandidatePointsPage({ onShowOnMap, onAreaAccepted }) {
  const toast = useRef(null);
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setCandidates(await fetchCandidatePoints());
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Adaylar yüklenemedi', detail: error.message, life: 4500 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const counts = useMemo(() => ({
    pending: candidates.filter((item) => item.isAccepted === null).length,
    accepted: candidates.filter((item) => item.isAccepted === true).length,
    rejected: candidates.filter((item) => item.isAccepted === false).length,
    all: candidates.length,
  }), [candidates]);

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('tr-TR');
    return candidates.filter((candidate) => {
      if (!matchesFilter(candidate, filter)) return false;
      if (!normalizedSearch) return true;
      return [candidate.id, candidate.name, candidate.type, candidate.district, candidate.neighborhood]
        .some((value) => String(value ?? '').toLocaleLowerCase('tr-TR').includes(normalizedSearch));
    });
  }, [candidates, filter, search]);

  const handleAccept = async () => {
    if (!acceptTarget) return;

    try {
      setProcessingId(acceptTarget.id);
      const updated = await acceptCandidatePoint(acceptTarget.id);
      setCandidates((current) => current.map((item) => item.id === updated.id ? updated : item));
      setAcceptTarget(null);
      onAreaAccepted?.(updated);
      toast.current?.show({
        severity: 'success',
        summary: 'Toplanma alanı oluşturuldu',
        detail: `${updated.name} kabul edildi ve ana listeye eklendi.`,
        life: 4500,
      });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Kabul edilemedi', detail: error.message, life: 4500 });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) return;

    try {
      setProcessingId(rejectTarget.id);
      const updated = await rejectCandidatePoint(rejectTarget.id, rejectionReason.trim());
      setCandidates((current) => current.map((item) => item.id === updated.id ? updated : item));
      setRejectTarget(null);
      setRejectionReason('');
      toast.current?.show({
        severity: 'info',
        summary: 'Aday reddedildi',
        detail: `${updated.name} için ret kararı kaydedildi.`,
        life: 4500,
      });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Reddedilemedi', detail: error.message, life: 4500 });
    } finally {
      setProcessingId(null);
    }
  };

  const decisionTemplate = (candidate) => {
    if (candidate.isAccepted === true) return <span className="cnd-status accepted"><i className="pi pi-check" /> Kabul edildi</span>;
    if (candidate.isAccepted === false) return <span className="cnd-status rejected"><i className="pi pi-times" /> Reddedildi</span>;
    return <span className="cnd-status pending"><i className="pi pi-clock" /> Karar bekliyor</span>;
  };

  const nameTemplate = (candidate) => (
    <div className="cnd-name-cell">
      <span className="cnd-pin"><i className="pi pi-map-marker" /></span>
      <div><strong>{candidate.name}</strong><small>{candidate.type || 'Tür belirtilmemiş'}</small></div>
    </div>
  );

  const locationTemplate = (candidate) => (
    <div className="cnd-location-cell">
      <strong>{candidate.district || '—'}</strong>
      <small>{candidate.neighborhood || 'Mahalle belirtilmemiş'}</small>
    </div>
  );

  const actionTemplate = (candidate) => (
    <div className="cnd-actions">
      <Button icon="pi pi-map-marker" className="cnd-action cnd-action-map" aria-label="Haritada göster" tooltip="Haritada göster" tooltipOptions={{ position: 'top', showDelay: 250 }} onClick={() => onShowOnMap(candidate)} />
      {candidate.isAccepted === null && (
        <>
          <Button label="Reddet" icon="pi pi-times" className="cnd-action cnd-action-reject" aria-label="Reddet" disabled={processingId === candidate.id} onClick={() => { setRejectTarget(candidate); setRejectionReason(''); }} />
          <Button label="Kabul" icon="pi pi-check" className="cnd-action cnd-action-accept" aria-label="Kabul et" onClick={() => setAcceptTarget(candidate)} />
        </>
      )}
    </div>
  );

  return (
    <section className="cnd-page">
      <Toast ref={toast} position="top-right" baseZIndex={12000} className="alp-toast" />

      <div className="cnd-summary-grid">
        <article className="cnd-summary total"><i className="pi pi-map" /><div><span>Toplam aday</span><strong>{counts.all}</strong></div></article>
        <article className="cnd-summary pending"><i className="pi pi-clock" /><div><span>Bekleyen</span><strong>{counts.pending}</strong></div></article>
        <article className="cnd-summary accepted"><i className="pi pi-check-circle" /><div><span>Kabul edilen</span><strong>{counts.accepted}</strong></div></article>
        <article className="cnd-summary rejected"><i className="pi pi-times-circle" /><div><span>Reddedilen</span><strong>{counts.rejected}</strong></div></article>
      </div>

      <div className="cnd-toolbar">
        <div className="cnd-filters">
          {filters.map((item) => (
            <button key={item.key} type="button" className={filter === item.key ? 'active' : ''} onClick={() => setFilter(item.key)}>
              <i className={`pi ${item.icon}`} />{item.label}<span>{counts[item.key]}</span>
            </button>
          ))}
        </div>
        <span className="cnd-search"><i className="pi pi-search" /><InputText value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Alan, ilçe veya mahalle ara..." /></span>
      </div>

      <div className="cnd-table-card">
        <DataTable value={filteredCandidates} dataKey="id" loading={loading} paginator rows={10} rowsPerPageOptions={[10, 15, 25]} emptyMessage="Bu filtreye uygun aday nokta bulunmuyor." stripedRows rowHover responsiveLayout="scroll" currentPageReportTemplate="{first}-{last} / {totalRecords} aday" paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport">
          <Column field="id" header="ID" sortable body={(candidate) => <span className="cnd-id">#{candidate.id}</span>} style={{ width: '86px' }} />
          <Column field="name" header="Aday Alan" sortable body={nameTemplate} style={{ minWidth: '270px' }} />
          <Column header="Konum" body={locationTemplate} sortable sortField="district" style={{ minWidth: '180px' }} />
          <Column field="capacity" header="Kapasite" sortable body={(candidate) => <strong className="cnd-number">{formatNumber(candidate.capacity)} kişi</strong>} style={{ minWidth: '130px' }} />
          <Column field="areaSize" header="Alan" sortable body={(candidate) => <span className="cnd-number">{formatNumber(candidate.areaSize, 2)} m²</span>} style={{ minWidth: '130px' }} />
          <Column header="Karar" body={decisionTemplate} style={{ minWidth: '150px' }} />
          <Column header="İşlemler" body={actionTemplate} frozen alignFrozen="right" headerClassName="cnd-actions-header" bodyClassName="cnd-actions-column" style={{ minWidth: '210px' }} />
        </DataTable>
      </div>

      <Dialog visible={Boolean(acceptTarget)} header="Aday noktayı kabul et" modal draggable={false} className="cnd-confirm-dialog cnd-accept-dialog" style={{ width: '480px' }} onHide={() => setAcceptTarget(null)} footer={(
        <div className="cnd-dialog-actions"><Button label="Vazgeç" icon="pi pi-times" className="cnd-dialog-cancel" onClick={() => setAcceptTarget(null)} /><Button label="Kabul Et ve Ekle" icon="pi pi-check" className="cnd-dialog-accept" loading={processingId === acceptTarget?.id} onClick={handleAccept} /></div>
      )}>
        <div className="cnd-confirm-copy"><span className="accept"><i className="pi pi-check-circle" /></span><div><small>KABUL EDİLECEK ADAY</small><strong>{acceptTarget?.name}</strong><p>Bu kayıt ana toplanma alanı listesine ve haritaya aynı ID ile eklenecek.</p></div></div>
        <div className="cnd-confirm-meta"><span><i className="pi pi-hashtag" />{acceptTarget?.id}</span><span><i className="pi pi-map-marker" />{acceptTarget?.district || 'İlçe yok'}</span><span><i className="pi pi-users" />{formatNumber(acceptTarget?.capacity)} kişi</span></div>
      </Dialog>

      <Dialog visible={Boolean(rejectTarget)} header="Aday noktayı reddet" modal draggable={false} className="cnd-confirm-dialog cnd-reject-dialog" style={{ width: '520px' }} onHide={() => setRejectTarget(null)} footer={(
        <div className="cnd-dialog-actions"><Button label="Vazgeç" icon="pi pi-arrow-left" className="cnd-dialog-cancel" onClick={() => setRejectTarget(null)} /><Button label="Adayı Reddet" icon="pi pi-times" className="cnd-dialog-reject" disabled={!rejectionReason.trim()} loading={processingId === rejectTarget?.id} onClick={handleReject} /></div>
      )}>
        <div className="cnd-confirm-copy"><span className="reject"><i className="pi pi-times-circle" /></span><div><small>REDDEDİLECEK ADAY</small><strong>{rejectTarget?.name}</strong><p>Ret nedeni işlem geçmişinde ve aday kaydında saklanacak.</p></div></div>
        <label className="cnd-reason-label"><span>Ret nedeni <em>*</em></span><InputTextarea value={rejectionReason} rows={4} autoResize maxLength={500} className="cnd-reason" placeholder="Adayın neden uygun olmadığını açıklayın..." onChange={(event) => setRejectionReason(event.target.value)} /><small>{rejectionReason.length}/500</small></label>
      </Dialog>
    </section>
  );
}

export default CandidatePointsPage;
