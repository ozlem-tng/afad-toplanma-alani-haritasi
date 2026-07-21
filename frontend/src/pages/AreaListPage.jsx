import { useMemo, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import '../styles/AreaListPage.css';

const formatNumber = (value, maximumFractionDigits = 0) =>
  Number(value || 0).toLocaleString('tr-TR', { maximumFractionDigits });

function AreaListPage({ areas, setAreas, onActivity, onShowOnMap, onDelete }) {
  const toast = useRef(null);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const counts = useMemo(() => ({
    total: areas.length,
    capacity: areas.reduce((sum, area) => sum + Number(area.capacity || 0), 0),
    types: new Set(areas.map((area) => area.type).filter(Boolean)).size,
  }), [areas]);
  const averageCapacity = counts.total ? Math.round(counts.capacity / counts.total) : 0;

  const filteredAreas = useMemo(() => {
    const search = filter.trim().toLocaleLowerCase('tr-TR');
    if (!search) return areas;

    return areas.filter((area) =>
      [area.name, area.type, area.id, area.poiId]
        .some((value) => String(value ?? '').toLocaleLowerCase('tr-TR').includes(search)),
    );
  }, [areas, filter]);

  const closeEditDialog = () => {
    setEditDialog(false);
    setSelected(null);
  };

  const handleSave = () => {
    if (!selected) return;
    if (!selected.name.trim() || !selected.type.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Eksik bilgi', detail: 'Alan adı ve alan türünü doldurun.', life: 3500 });
      return;
    }

    setAreas((current) => current.map((area) =>
      area.recordKey === selected.recordKey
        ? { ...selected, name: selected.name.trim(), type: selected.type.trim() }
        : area,
    ));
    onActivity('updated', { ...selected });
    closeEditDialog();
    toast.current?.show({ severity: 'success', summary: 'Başarılı', detail: 'Toplanma alanı güncellendi.', life: 3000 });
  };

  const confirmDelete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!deleteTarget) return;

    const target = deleteTarget;
    const overlay = event.currentTarget.closest('.alp-delete-overlay');
    if (overlay) overlay.style.display = 'none';
    setDeleteTarget(null);

    window.setTimeout(() => {
      onDelete(target);
      toast.current?.show({
        severity: 'success',
        summary: 'Silindi',
        detail: `${target.name} listeden kaldırıldı.`,
        life: 3000,
      });
    }, 0);
  };

  const actionTemplate = (area) => (
    <div className="alp-actions">
      <Button
        icon="pi pi-eye"
        text
        rounded
        className="alp-action-view"
        aria-label={`${area.name} alanını haritada göster`}
        tooltip="Haritada göster"
        tooltipOptions={{ position: 'top', showDelay: 250 }}
        onClick={() => onShowOnMap(area)}
      />
      <Button icon="pi pi-pencil" severity="success" text rounded aria-label={`${area.name} alanını düzenle`} tooltip="Düzenle" onClick={() => { setSelected({ ...area }); setEditDialog(true); }} />
      <Button icon="pi pi-trash" severity="danger" text rounded aria-label={`${area.name} alanını sil`} tooltip="Sil" onClick={() => setDeleteTarget(area)} />
    </div>
  );

  return (
    <section className="alp-page">
      <Toast ref={toast} position="top-right" className="alp-toast" />
      {deleteTarget && (
        <div className="alp-delete-overlay" role="presentation" onMouseDown={() => setDeleteTarget(null)}>
          <div className="alp-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="alp-delete-header">
              <span className="alp-delete-icon"><i className="pi pi-exclamation-triangle" /></span>
              <div>
                <h3 id="delete-dialog-title">Toplanma alanını sil</h3>
                <p>Bu işlem için onay vermeniz gerekiyor.</p>
              </div>
              <button type="button" className="alp-delete-close" aria-label="Pencereyi kapat" onClick={() => setDeleteTarget(null)}><i className="pi pi-times" /></button>
            </div>
            <div className="alp-confirm-copy">
              <strong>{deleteTarget.name}</strong>
              <span>toplanma alanını listeden silmek istediğinize emin misiniz?</span>
              <small>Bu değişiklik yalnızca açık admin oturumunda geçerlidir.</small>
            </div>
            <div className="alp-delete-actions">
              <button type="button" className="alp-delete-cancel" onClick={() => setDeleteTarget(null)}>Vazgeç</button>
              <button type="button" className="alp-delete-confirm" onPointerDown={confirmDelete}><i className="pi pi-trash" /> Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      <div className="alp-controls">
        <span className="alp-search">
          <i className="pi pi-search" />
          <InputText value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Alan adı, tür, ID veya POI ID ara..." />
        </span>
        <div className="alp-stats">
          <div className="alp-stat alp-stat-total"><span>Toplam</span><strong>{counts.total}</strong></div>
          <div className="alp-stat alp-stat-open"><span>Tür</span><strong>{counts.types}</strong></div>
          <div className="alp-stat alp-stat-maintenance"><span>Toplam kapasite</span><strong>{formatNumber(counts.capacity)}</strong></div>
          <div className="alp-stat alp-stat-closed"><span>Ortalama kapasite</span><strong>{formatNumber(averageCapacity)}</strong></div>
        </div>
      </div>

      <div className="alp-table-card">
        <DataTable dataKey="recordKey" value={filteredAreas} paginator rows={10} rowsPerPageOptions={[10, 20, 50]} stripedRows rowHover scrollable emptyMessage="Aramanızla eşleşen alan bulunamadı." paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport" currentPageReportTemplate="{first}-{last} / {totalRecords} alan" className="alp-table">
          <Column field="id" header="ID" sortable className="alp-id-column" />
          <Column field="poiId" header="POI ID" sortable style={{ minWidth: '120px' }} />
          <Column field="name" header="Alan Adı" sortable body={(area) => <strong className="alp-area-name">{area.name}</strong>} style={{ minWidth: '270px' }} />
          <Column field="type" header="Alan Türü" sortable style={{ minWidth: '125px' }} />
          <Column field="capacity" header="Kapasite" sortable body={(area) => `${formatNumber(area.capacity)} kişi`} style={{ minWidth: '130px' }} />
          <Column field="areaSize" header="Alan (m²)" sortable body={(area) => formatNumber(area.areaSize, 2)} style={{ minWidth: '130px' }} />
          <Column field="latitude" header="Enlem" body={(area) => formatNumber(area.latitude, 6)} style={{ minWidth: '125px' }} />
          <Column field="longitude" header="Boylam" body={(area) => formatNumber(area.longitude, 6)} style={{ minWidth: '125px' }} />
          <Column header="İşlemler" body={actionTemplate} style={{ minWidth: '155px' }} />
        </DataTable>
      </div>

      <Dialog visible={editDialog} header="Toplanma Alanını Düzenle" modal className="alp-dialog" style={{ width: '680px' }} breakpoints={{ '768px': 'calc(100vw - 32px)' }} onHide={closeEditDialog} footer={<div className="alp-dialog-actions"><Button label="İptal" severity="secondary" text onClick={closeEditDialog} /><Button label="Değişiklikleri Kaydet" icon="pi pi-check" onClick={handleSave} /></div>}>
        {selected && (
          <div className="alp-form">
            <label className="alp-field" htmlFor="area-name"><span>Alan adı <em>*</em></span><InputText id="area-name" value={selected.name} onChange={(event) => setSelected({ ...selected, name: event.target.value })} /></label>
            <label className="alp-field" htmlFor="area-type"><span>Alan türü <em>*</em></span><InputText id="area-type" value={selected.type} onChange={(event) => setSelected({ ...selected, type: event.target.value })} /></label>
            <div className="alp-form-row">
              <label className="alp-field" htmlFor="area-capacity"><span>Kapasite</span><InputNumber inputId="area-capacity" value={selected.capacity} min={0} locale="tr-TR" suffix=" kişi" onValueChange={(event) => setSelected({ ...selected, capacity: event.value })} /></label>
              <label className="alp-field" htmlFor="area-size"><span>Alan büyüklüğü</span><InputNumber inputId="area-size" value={selected.areaSize} min={0} locale="tr-TR" suffix=" m²" onValueChange={(event) => setSelected({ ...selected, areaSize: event.value })} /></label>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
}

export default AreaListPage;
