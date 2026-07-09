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
        ? '#2563eb'
        : area.availability === 'available'
          ? '#16a34a'
          : '#dc2626';

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
        center: fromLonLat([32.8597, 39.9179]),
        zoom: 11,
      }),
    });

    mapInstance.current.on('click', (event) => {
      mapInstance.current.forEachFeatureAtPixel(event.pixel, (feature) => {
        const area = feature.get('areaData');

        if (area) {
          onSelectArea(area);
        }
      });
    });

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
  }, [areas]);

  // Seçili marker değişince stil ve zoom güncelle
  useEffect(() => {
    updateMarkerStyles();

    if (!selectedArea || !mapInstance.current) return;

    mapInstance.current.getView().animate({
      center: fromLonLat([
        selectedArea.longitude,
        selectedArea.latitude,
      ]),
      zoom: 16,
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