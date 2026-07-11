const DEFAULT_CENTER = fromLonLat([32.8597, 39.9179]);
const DEFAULT_ZOOM = 11;
const SELECTED_AREA_ZOOM = 16;

import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import 'ol/ol.css';
import { COLORS } from '../styles/colors';
import { boundingExtent } from 'ol/extent';

function MapView({ areas = [], selectedArea, onSelectArea }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vectorSourceRef = useRef(null);
  const featuresRef = useRef([]);

  // Feature'ları oluştur
  const createFeatures = (areas) => {
    return areas.map((area) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([area.longitude, area.latitude])),
      });

      feature.set('areaData', area);

      return feature;
    });
  };
  // Marker stillerini güncelle
  const updateMarkerStyles = () => {
    featuresRef.current.forEach((feature) => {
      const area = feature.get('areaData');

      const isSelected = selectedArea?.id === area.id;

      const markerColor = isSelected
        ? COLORS.primary
        : area.availability === 'available'
          ? COLORS.secondary
          : COLORS.danger;

      feature.setStyle(
        new Style({
          image: new Circle({
            radius: isSelected ? 10 : 8,
            fill: new Fill({
              color: markerColor,
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 2,
            }),
          }),
        }),
      );
    });
  };
  const fitMapToAreas = () => {
    if (!mapInstance.current || areas.length === 0) return;

    const coordinates = areas.map((area) =>
      fromLonLat([area.longitude, area.latitude]),
    );

    const extent = boundingExtent(coordinates);

    mapInstance.current.getView().fit(extent, {
      padding: [80, 80, 80, 80],
      duration: 800,
      maxZoom: 16,
    });
  };
  const styleZoomButtons = () => {
    const zoomButtons = document.querySelectorAll('.ol-zoom button');

    zoomButtons.forEach((button) => {
      button.style.width = '44px';
      button.style.height = '44px';
      button.style.fontSize = '22px';
      button.style.marginBottom = '6px';

      button.style.background = COLORS.primary;
      button.style.color = '#fff';

      button.style.border = 'none';
      button.style.borderRadius = '12px';

      button.style.boxShadow = '0 8px 20px rgba(10,54,117,.18)';
      button.style.transition = 'all .2s ease';

      button.onmouseenter = () => {
        button.style.background = COLORS.primaryHover;
        button.style.transform = 'scale(1.05)';
      };

      button.onmouseleave = () => {
        button.style.background = COLORS.primary;
        button.style.transform = 'scale(1)';
      };
    });
  };
  const handleMapClick = (event) => {
    const feature = mapInstance.current.forEachFeatureAtPixel(
      event.pixel,
      (feature) => feature,
    );

    if (feature) {
      onSelectArea(feature.get('areaData'));
    } else {
      onSelectArea(null);
    }
  };

  // Haritayı sadece 1 kez oluştur
  useEffect(() => {
    vectorSourceRef.current = new VectorSource();

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
    });

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      }),
    });

    styleZoomButtons();

    mapInstance.current.on('click', handleMapClick);

    return () => {
      mapInstance.current?.setTarget(undefined);
    };
  }, []);

  // Areas değiştiğinde sadece markerları güncelle
  useEffect(() => {
    if (!vectorSourceRef.current) return;

    vectorSourceRef.current.clear();

    const features = createFeatures(areas);

    featuresRef.current = features;

    vectorSourceRef.current.addFeatures(features);

    updateMarkerStyles();
    fitMapToAreas();
  }, [areas]);

  // Seçili marker değişince stil ve zoom güncelle
  useEffect(() => {
    updateMarkerStyles();

    if (!selectedArea || !mapInstance.current) return;

    mapInstance.current.getView().animate({
      center: fromLonLat([selectedArea.longitude, selectedArea.latitude]),
      zoom: SELECTED_AREA_ZOOM,
      duration: 800,
    });
  }, [selectedArea]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: 'calc(100vh - 70px)',
      }}
    />
  );
}

export default MapView;
