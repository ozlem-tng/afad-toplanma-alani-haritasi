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
import { fromLonLat, toLonLat } from 'ol/proj';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { boundingExtent } from 'ol/extent';

import HeatmapLayer from 'ol/layer/Heatmap';
import GeoJSON from 'ol/format/GeoJSON';

import 'ol/ol.css';

import { COLORS } from '../styles/colors';

const DEFAULT_CENTER = fromLonLat([32.8597, 39.9179]);
const DEFAULT_ZOOM = 11;
const SELECTED_AREA_ZOOM = 16;
const MIN_START_POINT_ZOOM = 15;

function MapView({
  areas = [],
  selectedArea,
  onSelectArea,
  userLocation,
  startPoint,
  isSelectingStartPoint,
  onSelectStartPoint,
  isSelectingAreaPoint,
  onSelectAreaPoint,
  onAreaPointZoomWarning,
  routeGeometry,
  travelMode,
  showHeatmap,
  onZoomChange,
  height,
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const heatmapSourceRef = useRef(new VectorSource());
  const heatmapLayerRef = useRef(
    new HeatmapLayer({
      source: heatmapSourceRef.current,
      blur: 30,
      radius: 18,
      visible: false,
      opacity: 0.8,
    }),
  );

  const vectorSourceRef = useRef(null);
  const routeSourceRef = useRef(null);

  const featuresRef = useRef([]);
  const previousAreasKeyRef = useRef('');
  const markerLayerRef = useRef(null);

  const isValidCoordinate = (lat, lon) => {
    const latitude = Number(lat);
    const longitude = Number(lon);
    return (
      !isNaN(latitude) && !isNaN(longitude) && lat !== null && lon !== null
    );
  };

  const createFeatures = (areaList) => {
    const validAreas = areaList.filter(
      (area) => area && isValidCoordinate(area.latitude, area.longitude),
    );

    const features = validAreas.map((area) => {
      const feature = new Feature({
        geometry: new Point(
          fromLonLat([Number(area.longitude), Number(area.latitude)]),
        ),
      });

      feature.set('areaData', area);

      return feature;
    });

    if (startPoint) {
      const startFeature = new Feature({
        geometry: new Point(
          fromLonLat([startPoint.longitude, startPoint.latitude]),
        ),
      });

      startFeature.set('featureType', 'startPoint');

      startFeature.setStyle(
        new Style({
          image: new Circle({
            radius: 9,
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

      features.push(startFeature);
    }

    if (
      userLocation &&
      isValidCoordinate(userLocation.latitude, userLocation.longitude)
    ) {
      const userFeature = new Feature({
        geometry: new Point(
          fromLonLat([
            Number(userLocation.longitude),
            Number(userLocation.latitude),
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

  const updateMarkerStyles = () => {
    featuresRef.current.forEach((feature) => {
      const area = feature.get('areaData');

      if (!area) return;

      const isSelected =
        (selectedArea?.recordKey || selectedArea?.id) ===
        (area.recordKey || area.id);

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

  const fitMapToAreas = () => {
    if (!mapInstance.current || !areas) return;

    const validAreas = areas.filter(
      (area) => area && isValidCoordinate(area.latitude, area.longitude),
    );

    if (validAreas.length === 0) return;

    const view = mapInstance.current.getView();

    if (validAreas.length === 1) {
      view.animate({
        center: fromLonLat([
          Number(validAreas[0].longitude),
          Number(validAreas[0].latitude),
        ]),
        zoom: 16,
        duration: 800,
      });

      return;
    }

    const coordinates = validAreas.map((area) =>
      fromLonLat([Number(area.longitude), Number(area.latitude)]),
    );

    try {
      const extent = boundingExtent(coordinates);
      const isExtentValid = extent && extent.every((coord) => isFinite(coord));

      if (isExtentValid) {
        view.fit(extent, {
          padding: [150, 150, 150, 150],
          duration: 800,
          maxZoom: validAreas.length <= 5 ? 15 : 14,
        });
      }
    } catch (e) {
      console.warn('Harita sınırları hesaplanamadı:', e);
    }
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
    if (!mapInstance.current) return;

    if (isSelectingAreaPoint) {
      const zoom = mapInstance.current.getView().getZoom() ?? 0;

      if (zoom < 15) {
        onAreaPointZoomWarning?.(zoom);
        return;
      }

      const [longitude, latitude] = toLonLat(event.coordinate);
      onSelectAreaPoint?.({ latitude, longitude, zoom });
      return;
    }

    // Başlangıç noktası seçme modu
    if (isSelectingStartPoint) {
      const currentZoom = mapInstance.current.getView().getZoom();

      if (currentZoom < MIN_START_POINT_ZOOM) {
        return;
      }

      const [longitude, latitude] = toLonLat(event.coordinate);

      onSelectStartPoint?.({
        latitude,
        longitude,
      });

      return;
    }
    const areaFeature = mapInstance.current.forEachFeatureAtPixel(
      event.pixel,
      (feature) => {
        const area = feature.get('areaData');

        return area ? feature : undefined;
      },
    );

    const area = areaFeature?.get('areaData');

    if (area) {
      onSelectArea?.(area);
      return;
    }

    onSelectArea?.(null);
  };

  const selectedAreaSourceRef = useRef(new VectorSource());

  const selectedAreaLayerRef = useRef(
    new VectorLayer({
      source: selectedAreaSourceRef.current,
      zIndex: 5,
      style: new Style({
        fill: new Fill({
          color: 'rgba(37, 99, 235, 0.20)',
        }),
        stroke: new Stroke({
          color: '#2563eb',
          width: 3,
        }),
      }),
    }),
  );

  useEffect(() => {
    vectorSourceRef.current = new VectorSource();
    routeSourceRef.current = new VectorSource();

    markerLayerRef.current = new VectorLayer({
      source: vectorSourceRef.current,
      zIndex: 10,
    });

    const routeLayer = new VectorLayer({
      source: routeSourceRef.current,
      zIndex: 20,
    });

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        heatmapLayerRef.current,
        selectedAreaLayerRef.current,
        markerLayerRef.current,
        routeLayer,
      ],
      view: new View({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      }),
    });

    mapInstance.current.getView().on('change:resolution', () => {
      const zoom = mapInstance.current?.getView().getZoom();
      onZoomChange?.(zoom >= MIN_START_POINT_ZOOM);
    });

    styleZoomButtons();

    mapInstance.current.on('click', (event) => {
      handleMapClick(event);
    });
    return () => {
      mapInstance.current?.setTarget(undefined);
      mapInstance.current = null;
    };
  }, [isSelectingAreaPoint, isSelectingStartPoint]);

  useEffect(() => {
    if (!vectorSourceRef.current) return;

    vectorSourceRef.current.clear();

    const features = createFeatures(areas);

    featuresRef.current = features;
    vectorSourceRef.current.addFeatures(features);

    updateMarkerStyles();

    const currentAreasKey = areas
      .map((area) => area?.recordKey || area?.id || '')
      .sort((a, b) => String(a).localeCompare(String(b)))
      .join(',');

    const areasActuallyChanged =
      previousAreasKeyRef.current !== currentAreasKey;

    if (areasActuallyChanged && !routeGeometry) {
      fitMapToAreas();
      previousAreasKeyRef.current = currentAreasKey;
    }
  }, [areas, userLocation, startPoint]);

  useEffect(() => {
    updateMarkerStyles();

    if (!selectedArea || !mapInstance.current) return;
    if (!isValidCoordinate(selectedArea.latitude, selectedArea.longitude))
      return;

    if (userLocation) return;
  }, [selectedArea, userLocation]);

  useEffect(() => {
    if (
      !mapInstance.current ||
      !userLocation ||
      !isValidCoordinate(userLocation.latitude, userLocation.longitude) ||
      routeGeometry
    ) {
      return;
    }

    const view = mapInstance.current.getView();

    if (
      selectedArea &&
      isValidCoordinate(selectedArea.latitude, selectedArea.longitude)
    ) {
      try {
        const extent = boundingExtent([
          fromLonLat([
            Number(userLocation.longitude),
            Number(userLocation.latitude),
          ]),
          fromLonLat([
            Number(selectedArea.longitude),
            Number(selectedArea.latitude),
          ]),
        ]);

        const isExtentValid =
          extent && extent.every((coord) => isFinite(coord));

        if (isExtentValid) {
          view.fit(extent, {
            padding: [120, 120, 120, 120],
            duration: 800,
            maxZoom: 19,
          });
        }
      } catch (e) {
        console.warn('Kullanıcı-alan sınırı hesaplanamadı:', e);
      }

      return;
    }

    view.animate({
      center: fromLonLat([
        Number(userLocation.longitude),
        Number(userLocation.latitude),
      ]),
      zoom: 15,
      duration: 800,
    });
  }, [userLocation, selectedArea, routeGeometry]);

  useEffect(() => {
    if (!routeSourceRef.current || !mapInstance.current) {
      return;
    }

    routeSourceRef.current.clear();

    const routeCoordinates = routeGeometry?.coordinates;

    if (!Array.isArray(routeCoordinates) || routeCoordinates.length < 2) {
      return;
    }

    const projectedCoordinates = routeCoordinates.map(([longitude, latitude]) =>
      fromLonLat([Number(longitude), Number(latitude)]),
    );

    const routeFeature = new Feature({
      geometry: new LineString(projectedCoordinates),
    });

    routeFeature.set('featureType', 'route');

    routeFeature.setStyle([
      new Style({
        stroke: new Stroke({
          color: '#ffffff',
          width: 10,
        }),
      }),
      new Style({
        stroke: new Stroke({
          color: COLORS.primary,
          width: 6,
          lineDash: travelMode === 'walking' ? [14, 10] : undefined,
        }),
      }),
    ]);

    routeSourceRef.current.addFeature(routeFeature);

    const routeExtent = routeFeature.getGeometry().getExtent();

    const isRouteExtentValid =
      routeExtent && routeExtent.every((coord) => isFinite(coord));

    if (isRouteExtentValid) {
      mapInstance.current.getView().fit(routeExtent, {
        padding: [100, 100, 100, 100],
        duration: 900,
        maxZoom: 17,
      });
    }
  }, [routeGeometry]);

  useEffect(() => {
    const source = selectedAreaSourceRef.current;
    source.clear();

    if (!selectedArea?.geometry || !mapInstance.current) return;

    try {
      const features = new GeoJSON().readFeatures(selectedArea.geometry, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });

      if (!features.length) {
        console.warn('Polygon feature oluşturulamadı.');
        return;
      }

      source.addFeatures(features);

      const extent = source.getExtent();
      const isExtentValid = extent?.every((value) => Number.isFinite(value));

      if (isExtentValid) {
        mapInstance.current.getView().fit(extent, {
          padding: [80, 80, 80, 80],
          duration: 700,
          maxZoom: 18,
        });
      }
    } catch (error) {
      console.error('Polygon çizilemedi:', error);
    }
  }, [selectedArea]);

  useEffect(() => {
    if (!heatmapLayerRef.current || !heatmapSourceRef.current) return;

    const source = heatmapSourceRef.current;

    source.clear();

    heatmapLayerRef.current.setVisible(showHeatmap);

    markerLayerRef.current?.setVisible(!showHeatmap);

    const view = mapInstance.current?.getView();

    if (showHeatmap) {
      selectedAreaSourceRef.current.clear(); // ← BURAYA
    }

    if (showHeatmap && view) {
      selectedAreaSourceRef.current.clear();

      view.animate({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        duration: 700,
      });
    }

    if (!showHeatmap) return;

    const features = areas
      .filter(
        (area) => area && isValidCoordinate(area.latitude, area.longitude),
      )
      .map((area) => {
        const feature = new Feature({
          geometry: new Point(
            fromLonLat([Number(area.longitude), Number(area.latitude)]),
          ),
        });

        feature.set('weight', Math.min((area.capacity || 500) / 5000, 1));

        return feature;
      });

    source.addFeatures(features);
  }, [areas, showHeatmap]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height,
      }}
    />
  );
}

export default MapView;
