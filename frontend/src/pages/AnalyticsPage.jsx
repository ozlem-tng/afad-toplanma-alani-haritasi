import { useMemo } from 'react';
import { Chart } from 'primereact/chart';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import '../styles/AnalyticsPage.css';

const COLORS = ['#4b91dc', '#35a853', '#ed8b32', '#e5525b', '#8f63d8', '#24a9a2'];
const formatExact = (value) => Number(value || 0).toLocaleString('tr-TR');
const formatCompact = (value) => new Intl.NumberFormat('tr-TR', {
  notation: 'compact',
  maximumFractionDigits: 1,
}).format(Number(value || 0));

function createBarData(entries, color, label = 'Alan sayısı') {
  return {
    labels: entries.map(([name]) => name),
    datasets: [{
      label,
      data: entries.map(([, value]) => value),
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
      borderRadius: 7,
      borderSkipped: false,
      maxBarThickness: 34,
    }],
  };
}

const axisStyle = {
  grid: { color: '#edf1f6' },
  border: { display: false },
  ticks: { color: '#66758b', font: { size: 12, weight: '500' } },
};

const countBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { displayColors: false },
    datalabels: { anchor: 'end', align: 'top', color: '#34445b', font: { size: 12, weight: '700' } },
  },
  scales: {
    x: { ...axisStyle, grid: { display: false } },
    y: { ...axisStyle, beginAtZero: true, grace: '15%', ticks: { ...axisStyle.ticks, precision: 0 } },
  },
};

const compactCapacityPlugins = {
  legend: { display: false },
  tooltip: {
    displayColors: false,
    callbacks: { label: (context) => ` ${formatExact(context.raw)} kişi` },
  },
  datalabels: {
    anchor: 'end',
    align: 'top',
    color: '#34445b',
    font: { size: 12, weight: '700' },
    formatter: formatCompact,
  },
};

const capacityBarOptions = {
  ...countBarOptions,
  plugins: compactCapacityPlugins,
  scales: {
    x: { ...axisStyle, grid: { display: false } },
    y: { ...axisStyle, beginAtZero: true, grace: '18%', ticks: { ...axisStyle.ticks, callback: formatCompact } },
  },
};

const horizontalCapacityOptions = {
  ...capacityBarOptions,
  indexAxis: 'y',
  plugins: {
    ...compactCapacityPlugins,
    datalabels: { ...compactCapacityPlugins.datalabels, anchor: 'end', align: 'right' },
  },
  scales: {
    x: { ...axisStyle, beginAtZero: true, grace: '18%', ticks: { ...axisStyle.ticks, callback: formatCompact } },
    y: { ...axisStyle, grid: { display: false } },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '64%',
  plugins: {
    legend: { position: 'bottom', labels: { color: '#526177', usePointStyle: true, pointStyle: 'circle', padding: 18, font: { size: 12, weight: '600' } } },
    tooltip: { callbacks: { label: (context) => ` ${context.label}: ${formatExact(context.raw)} alan` } },
    datalabels: { color: '#ffffff', font: { size: 13, weight: '800' }, formatter: formatCompact },
  },
};

function SummaryCard({ className, icon, label, value, exactValue, caption }) {
  return (
    <article className={`anl-summary-card ${className}`} title={exactValue}>
      <span className="anl-summary-icon"><i className={`pi ${icon}`} /></span>
      <span className="anl-summary-copy">
        <small>{label}</small>
        <strong>{value}</strong>
        <em>{caption}</em>
      </span>
      <i className={`pi ${icon} anl-summary-watermark`} />
    </article>
  );
}

function ChartCard({ title, subtitle, total, totalUnit = 'alan', type, data, options, icon, tone }) {
  return (
    <article className={`anl-chart-card ${tone}`}>
      <header>
        <div className="anl-chart-heading">
          <span className="anl-chart-icon"><i className={`pi ${icon}`} /></span>
          <div><h3>{title}</h3><p>{subtitle}</p></div>
        </div>
        <span className="anl-chart-total">{formatExact(total)} {totalUnit}</span>
      </header>
      <div className="anl-prime-chart"><Chart type={type} data={data} options={options} plugins={[ChartDataLabels]} /></div>
    </article>
  );
}

function AnalyticsPage({ areas }) {
  const analytics = useMemo(() => {
    const totalCapacity = areas.reduce((sum, area) => sum + Number(area.capacity || 0), 0);
    const typeEntries = Object.entries(areas.reduce((result, area) => {
      const label = area.type || 'BELİRTİLMEMİŞ';
      result[label] = (result[label] || 0) + 1;
      return result;
    }, {})).sort(([, first], [, second]) => second - first);

    const capacityGroups = [
      ['0–1.000 kişi', areas.filter((area) => area.capacity <= 1000).length],
      ['1.001–3.000 kişi', areas.filter((area) => area.capacity > 1000 && area.capacity <= 3000).length],
      ['3.001–10.000 kişi', areas.filter((area) => area.capacity > 3000 && area.capacity <= 10000).length],
      ['10.001+ kişi', areas.filter((area) => area.capacity > 10000).length],
    ];
    const capacityByType = Object.entries(areas.reduce((result, area) => {
      const label = area.type || 'BELİRTİLMEMİŞ';
      result[label] = (result[label] || 0) + Number(area.capacity || 0);
      return result;
    }, {})).sort(([, first], [, second]) => second - first);
    const highestCapacityAreas = [...areas]
      .sort((first, second) => Number(second.capacity || 0) - Number(first.capacity || 0))
      .slice(0, 8)
      .map((area) => [area.name, Number(area.capacity || 0)]);

    return {
      totalCapacity,
      averageCapacity: areas.length ? Math.round(totalCapacity / areas.length) : 0,
      typeCount: typeEntries.length,
      typeChart: {
        labels: typeEntries.map(([name]) => name),
        datasets: [{ data: typeEntries.map(([, count]) => count), backgroundColor: COLORS, borderColor: '#ffffff', borderWidth: 4, hoverOffset: 8 }],
      },
      capacityChart: createBarData(capacityGroups, COLORS[2]),
      capacityByTypeChart: createBarData(capacityByType, COLORS[1], 'Toplam kapasite'),
      highestCapacityChart: createBarData(highestCapacityAreas, COLORS[0], 'Kapasite'),
    };
  }, [areas]);

  return (
    <section className="anl-page">
      <div className="anl-summary-grid">
        <SummaryCard className="blue" icon="pi-map-marker" label="Toplam alan" value={formatExact(areas.length)} exactValue={`${formatExact(areas.length)} alan`} caption="GeoData kaydı" />
        <SummaryCard className="green" icon="pi-th-large" label="Alan türü" value={formatExact(analytics.typeCount)} exactValue={`${formatExact(analytics.typeCount)} tür`} caption="Farklı kategori" />
        <SummaryCard className="purple" icon="pi-users" label="Toplam kapasite" value={formatCompact(analytics.totalCapacity)} exactValue={`${formatExact(analytics.totalCapacity)} kişi`} caption="Tüm alanların toplamı" />
        <SummaryCard className="orange" icon="pi-chart-line" label="Ortalama kapasite" value={formatCompact(analytics.averageCapacity)} exactValue={`${formatExact(analytics.averageCapacity)} kişi`} caption="Alan başına" />
      </div>
      <div className="anl-chart-grid">
        <ChartCard tone="blue" icon="pi-chart-pie" title="Alan Türleri" subtitle="Toplanma alanlarının türlere göre dağılımı" total={areas.length} type="doughnut" data={analytics.typeChart} options={doughnutOptions} />
        <ChartCard tone="orange" icon="pi-chart-bar" title="Kapasite Dağılımı" subtitle="Kişi kapasitesi aralıklarına göre alan sayısı" total={areas.length} type="bar" data={analytics.capacityChart} options={countBarOptions} />
        <ChartCard tone="green" icon="pi-users" title="Türlere Göre Toplam Kapasite" subtitle="Her alan türünün toplam kişi kapasitesi" total={analytics.typeCount} totalUnit="tür" type="bar" data={analytics.capacityByTypeChart} options={capacityBarOptions} />
        <ChartCard tone="purple" icon="pi-sort-amount-up" title="En Yüksek Kapasiteli Alanlar" subtitle="GeoData kapasitesine göre ilk 8 alan" total={Math.min(areas.length, 8)} type="bar" data={analytics.highestCapacityChart} options={horizontalCapacityOptions} />
      </div>
    </section>
  );
}

export default AnalyticsPage;
