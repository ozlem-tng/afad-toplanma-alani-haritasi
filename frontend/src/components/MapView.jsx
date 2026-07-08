import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';

function MapView() {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([32.8597, 39.9179]),
        zoom: 14.5,
      }),
    });

    return () => map.setTarget(undefined);
  }, []);

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
