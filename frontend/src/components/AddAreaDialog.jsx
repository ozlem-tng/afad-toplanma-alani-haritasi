import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import '../styles/AreaListPage.css';

const emptyArea = {
  name: '',
  type: '',
  capacity: null,
  areaSize: null,
  latitude: null,
  longitude: null,
};

function AddAreaDialog({ visible, areaTypes, onHide, onSave }) {
  const [area, setArea] = useState(emptyArea);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (visible) {
      setArea(emptyArea);
      setSubmitted(false);
    }
  }, [visible]);

  const isValid =
    area.name.trim() &&
    area.type &&
    area.capacity !== null &&
    Number(area.capacity) >= 0 &&
    area.areaSize !== null &&
    Number(area.areaSize) >= 0 &&
    Number.isFinite(area.latitude) &&
    Number.isFinite(area.longitude) &&
    area.latitude >= -90 &&
    area.latitude <= 90 &&
    area.longitude >= -180 &&
    area.longitude <= 180;

  const handleSave = () => {
    setSubmitted(true);
    if (!isValid) return;

    onSave({
      ...area,
      name: area.name.trim(),
      type: area.type.trim(),
    });
  };

  const footer = (
    <div className="alp-dialog-actions">
      <Button label="İptal" severity="secondary" text onClick={onHide} />
      <Button label="Alanı Kaydet" icon="pi pi-check" onClick={handleSave} />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      header="Yeni Toplanma Alanı Ekle"
      modal
      className="alp-dialog"
      style={{ width: '720px' }}
      breakpoints={{ '768px': 'calc(100vw - 32px)' }}
      footer={footer}
      onHide={onHide}
    >
      <div className="alp-form">
        <div className="alp-dialog-intro">
          <i className="pi pi-map-marker" />
          <div>
            <strong>Toplanma alanı bilgileri</strong>
            <span>Yeni alanın temel bilgilerini ve harita koordinatlarını girin.</span>
          </div>
        </div>

        <label className="alp-field" htmlFor="new-area-name">
          <span>Alan adı <em>*</em></span>
          <InputText
            id="new-area-name"
            value={area.name}
            className={submitted && !area.name.trim() ? 'p-invalid' : ''}
            placeholder="Örn. Gençlik Parkı"
            onChange={(event) => setArea({ ...area, name: event.target.value })}
          />
        </label>

        <div className="alp-form-row">
          <label className="alp-field" htmlFor="new-area-type">
            <span>Alan türü <em>*</em></span>
            <Dropdown
              inputId="new-area-type"
              value={area.type}
              options={areaTypes}
              className={submitted && !area.type ? 'p-invalid' : ''}
              placeholder="Alan türünü seçin"
              editable
              onChange={(event) => setArea({ ...area, type: event.value })}
            />
          </label>
          <label className="alp-field" htmlFor="new-area-capacity">
            <span>Kapasite <em>*</em></span>
            <InputNumber
              inputId="new-area-capacity"
              value={area.capacity}
              min={0}
              locale="tr-TR"
              className={submitted && (area.capacity === null || !(Number(area.capacity) >= 0)) ? 'p-invalid' : ''}
              placeholder="Kişi kapasitesi"
              suffix=" kişi"
              onValueChange={(event) => setArea({ ...area, capacity: event.value })}
            />
          </label>
        </div>

        <label className="alp-field" htmlFor="new-area-size">
          <span>Alan büyüklüğü <em>*</em></span>
          <InputNumber
            inputId="new-area-size"
            value={area.areaSize}
            min={0}
            locale="tr-TR"
            className={submitted && (area.areaSize === null || !(Number(area.areaSize) >= 0)) ? 'p-invalid' : ''}
            placeholder="Alan büyüklüğü"
            suffix=" m²"
            onValueChange={(event) => setArea({ ...area, areaSize: event.value })}
          />
        </label>

        <div className="alp-form-row">
          <label className="alp-field" htmlFor="new-area-latitude">
            <span>Enlem <em>*</em></span>
            <InputNumber
              inputId="new-area-latitude"
              value={area.latitude}
              min={-90}
              max={90}
              minFractionDigits={6}
              maxFractionDigits={6}
              useGrouping={false}
              className={submitted && !Number.isFinite(area.latitude) ? 'p-invalid' : ''}
              placeholder="39.933400"
              onValueChange={(event) => setArea({ ...area, latitude: event.value })}
            />
          </label>
          <label className="alp-field" htmlFor="new-area-longitude">
            <span>Boylam <em>*</em></span>
            <InputNumber
              inputId="new-area-longitude"
              value={area.longitude}
              min={-180}
              max={180}
              minFractionDigits={6}
              maxFractionDigits={6}
              useGrouping={false}
              className={submitted && !Number.isFinite(area.longitude) ? 'p-invalid' : ''}
              placeholder="32.859700"
              onValueChange={(event) => setArea({ ...area, longitude: event.value })}
            />
          </label>
        </div>

        {submitted && !isValid && (
          <small className="p-error">Zorunlu alanları ve geçerli koordinatları kontrol edin.</small>
        )}
      </div>
    </Dialog>
  );
}

export default AddAreaDialog;
