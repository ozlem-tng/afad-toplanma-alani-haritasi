function FilterPanel({ open, areas, filters, setFilters, onApply, onClear }) {
  const districts = [...new Set(areas.map((area) => area.district))].sort(
    (a, b) => a.localeCompare(b, 'tr'),
  );

  const neighborhoods = [
    ...new Set(
      areas
        .filter((area) =>
          filters.district ? area.district === filters.district : true,
        )
        .map((area) => area.neighborhood),
    ),
  ].sort((a, b) => a.localeCompare(b, 'tr'));

  const types = [...new Set(areas.map((area) => area.type))].sort((a, b) =>
    a.localeCompare(b, 'tr'),
  );

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'district' ? { neighborhood: '' } : {}),
    }));
  };

  const clearFilters = () => {
    setFilters({
      district: '',
      neighborhood: '',
      type: '',
      capacity: '',
    });
    setFilters(emptyFilters);
    onApply?.(emptyFilters);
  };

  const selectStyle = {
    width: '100%',
    height: 42,
    borderRadius: 10,
    border: '1px solid #d6dce5',
    padding: '0 12px',
    fontSize: 14,
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 92,
        right: 24,
        width: 340,
        background: '#fff',
        borderRadius: 18,
        padding: 24,
        boxShadow: '0 10px 30px rgba(0,0,0,.15)',
        zIndex: 999,
        opacity: open ? 1 : 0,
        visibility: open ? 'visible' : 'hidden',
        transform: open ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all .25s ease',
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 16 }}>Filtreler</h3>

      <label>İlçe</label>
      <select
        style={selectStyle}
        value={filters.district}
        onChange={(e) => handleChange('district', e.target.value)}
      >
        <option value="">Tümü</option>
        {districts.map((district) => (
          <option key={district} value={district}>
            {district}
          </option>
        ))}
      </select>

      <label>Mahalle</label>
      <select
        style={selectStyle}
        value={filters.neighborhood}
        onChange={(e) => handleChange('neighborhood', e.target.value)}
      >
        <option value="">Tümü</option>
        {neighborhoods.map((neighborhood) => (
          <option key={neighborhood} value={neighborhood}>
            {neighborhood}
          </option>
        ))}
      </select>

      <label>Alan Türü</label>
      <select
        style={selectStyle}
        value={filters.type}
        onChange={(e) => handleChange('type', e.target.value)}
      >
        <option value="">Tümü</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <label>Kapasite</label>
      <select
        style={selectStyle}
        value={filters.capacity}
        onChange={(e) => handleChange('capacity', e.target.value)}
      >
        <option value="">Tümü</option>
        <option value="0-1000">0 - 1000</option>
        <option value="1000-3000">1000 - 3000</option>
        <option value="3000+">3000+</option>
      </select>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginTop: 24,
        }}
      >
        <button
          onClick={onClear}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 10,
            border: '1px solid #0a3675',
            background: '#fff',
            color: '#0a3675',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Temizle
        </button>

        <button
          onClick={onApply}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 10,
            border: 'none',
            background: '#0a3675',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Uygula
        </button>
      </div>
    </div>
  );
}

export default FilterPanel;
