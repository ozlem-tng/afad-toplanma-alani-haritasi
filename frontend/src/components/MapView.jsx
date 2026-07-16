import { useEffect, useRef } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { fromLonLat } from 'ol/proj';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { boundingExtent } from 'ol/extent';

import 'ol/ol.css';

import { COLORS } from '../styles/colors';

const DEFAULT_CENTER = fromLonLat([32.8597, 39.9179]);
const DEFAULT_ZOOM = 11;
const SELECTED_AREA_ZOOM = 16;

function MapView({
  areas = [],
  selectedArea,
  onSelectArea,
  userLocation,
  routeGeometry,
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const vectorSourceRef = useRef(null);
  const routeSourceRef = useRef(null);

  const featuresRef = useRef([]);
  const previousAreasKeyRef = useRef('');

  // Toplanma alanı ve kullanıcı konumu feature'larını oluşturur.
  const createFeatures = (areaList) => {
    const features = areaList.map((area) => {
      const feature = new Feature({
        geometry: new Point(
          fromLonLat([area.longitude, area.latitude]),
        ),
      });

      feature.set('areaData', area);

      return feature;
    });

    if (userLocation) {
      const userFeature = new Feature({
        geometry: new Point(
          fromLonLat([
            userLocation.longitude,
            userLocation.latitude,
          ]),
        ),
      });

      userFeature.set('featureType', 'userLocation');

      userFeature.setStyle(
        new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({
              color: '#2563EB',
            }),
            stroke: new Stroke({
              color: '#FFFFFF',
              width: 3,
            }),
          }),
        }),
      );

      features.push(userFeature);
    }

    return features;
  };

  // Marker stillerini günceller.
  const updateMarkerStyles = () => {
    featuresRef.current.forEach((feature) => {
      const area = feature.get('areaData');

      if (!area) return;

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
              color: '#FFFFFF',
              width: 2,
            }),
          }),
        }),
      );
    });
  };

  // Filtrelenen toplanma alanlarını haritaya sığdırır.
  const fitMapToAreas = () => {
    if (!mapInstance.current || areas.length === 0) return;

    const view = mapInstance.current.getView();

    if (areas.length === 1) {
      view.animate({
        center: fromLonLat([
          areas[0].longitude,
          areas[0].latitude,
        ]),
        zoom: 16,
        duration: 800,
      });

      return;
    }

    const coordinates = areas.map((area) =>
      fromLonLat([area.longitude, area.latitude]),
    );

    const extent = boundingExtent(coordinates);

    view.fit(extent, {
      padding: [150, 150, 150, 150],
      duration: 800,
      maxZoom: areas.length <= 5 ? 15 : 14,
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
      button.style.color = '#FFFFFF';
      button.style.border = 'none';
      button.style.borderRadius = '12px';
      button.style.boxShadow =
        '0 8px 20px rgba(10,54,117,.18)';
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
    if (!mapInstance.current) return;

    const areaFeature =
      mapInstance.current.forEachFeatureAtPixel(
        event.pixel,
        (feature) => {
          const area = feature.get('areaData');

          return area ? feature : undefined;
        },
      );

    const area = areaFeature?.get('areaData');

    if (area) {
      onSelectArea(area);
      return;
    }

    onSelectArea(null);
  };

  // Haritayı yalnızca bir kez oluşturur.
  useEffect(() => {
    vectorSourceRef.current = new VectorSource();
    routeSourceRef.current = new VectorSource();

    const markerLayer = new VectorLayer({
      source: vectorSourceRef.current,
      zIndex: 2,
    });

    const routeLayer = new VectorLayer({
      source: routeSourceRef.current,
      zIndex: 1,
    });

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        routeLayer,
        markerLayer,
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
      mapInstance.current = null;
    };
  }, []);

  // Alanlar veya kullanıcı konumu değiştiğinde markerları günceller.
  useEffect(() => {
    if (!vectorSourceRef.current) return;

    vectorSourceRef.current.clear();

    const features = createFeatures(areas);

    featuresRef.current = features;
    vectorSourceRef.current.addFeatures(features);

    updateMarkerStyles();

    const currentAreasKey = areas
      .map((area) => area.id)
      .sort((a, b) => a - b)
      .join(',');

    const areasActuallyChanged =
      previousAreasKeyRef.current !== currentAreasKey;

    if (areasActuallyChanged && !routeGeometry) {
      fitMapToAreas();
      previousAreasKeyRef.current = currentAreasKey;
    }
  }, [areas, userLocation]);

  // Seçili marker değiştiğinde stil ve zoom günceller.
  useEffect(() => {
    updateMarkerStyles();

    if (!selectedArea || !mapInstance.current) return;

    if (userLocation) return;

    mapInstance.current.getView().animate({
      center: fromLonLat([
        selectedArea.longitude,
        selectedArea.latitude,
      ]),
      zoom: SELECTED_AREA_ZOOM,
      duration: 800,
    });
  }, [selectedArea, userLocation]);

  // Kullanıcı konumunu veya kullanıcı-alan ikilisini gösterir.
  useEffect(() => {
    if (
      !mapInstance.current ||
      !userLocation ||
      routeGeometry
    ) {
      return;
    }

    const view = mapInstance.current.getView();

    if (selectedArea) {
      const extent = boundingExtent([
        fromLonLat([
          userLocation.longitude,
          userLocation.latitude,
        ]),
        fromLonLat([
          selectedArea.longitude,
          selectedArea.latitude,
        ]),
      ]);

      view.fit(extent, {
        padding: [120, 120, 120, 120],
        duration: 800,
        maxZoom: 19,
      });

      return;
    }

    view.animate({
      center: fromLonLat([
        userLocation.longitude,
        userLocation.latitude,
      ]),
      zoom: 15,
      duration: 800,
    });
  }, [userLocation, selectedArea, routeGeometry]);

  // Backend'den gelen rota koordinatlarını haritada çizer.
  useEffect(() => {
    if (!routeSourceRef.current || !mapInstance.current) {
      return;
    }

    routeSourceRef.current.clear();

    const routeCoordinates = routeGeometry?.coordinates;

    if (
      !Array.isArray(routeCoordinates) ||
      routeCoordinates.length < 2
    ) {
      return;
    }

    const projectedCoordinates = routeCoordinates.map(
      ([longitude, latitude]) =>
        fromLonLat([longitude, latitude]),
    );

    const routeFeature = new Feature({
      geometry: new LineString(projectedCoordinates),
    });

    routeFeature.set('featureType', 'route');

    routeFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: COLORS.primary,
          width: 6,
        }),
      }),
    );

    routeSourceRef.current.addFeature(routeFeature);

    const routeExtent =
      routeFeature.getGeometry().getExtent();

    mapInstance.current.getView().fit(routeExtent, {
      padding: [100, 100, 100, 100],
      duration: 900,
      maxZoom: 17,
    });
  }, [routeGeometry]);

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