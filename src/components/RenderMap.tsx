import { useEffect } from "react";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-search";

interface RenderMapProps {
  mapType?: any;
  mapCenter?: any;
  mapZoom?: any;
  mapRef?: any;
  mapViewRef?: any;
  isDrawingComplete: (complete: boolean) => void;
}

export function RenderMap({
  mapType,
  mapCenter,
  mapZoom,
  mapRef,
  mapViewRef,
  isDrawingComplete,
}: RenderMapProps) {
  useEffect(() => {
    mapViewRef.current = mapRef.current.view;
    isDrawingComplete(true);
  });

  return (
    <arcgis-map
      basemap={mapType}
      center={mapCenter}
      zoom={mapZoom}
      ref={mapRef}
    >
      <arcgis-zoom position="top-right"></arcgis-zoom>
    </arcgis-map>
  );
}
