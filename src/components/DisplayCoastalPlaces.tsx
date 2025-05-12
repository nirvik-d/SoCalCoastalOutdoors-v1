import { useEffect } from "react";

interface DisplayPlacesProps {
  mapRef?: any;
  layerRef?: any;
}

export function DisplayCoastalPlaces({ mapRef, layerRef }: DisplayPlacesProps) {
  useEffect(() => {
    const arcgisMap = mapRef.current;
    if (!arcgisMap) return;

    const coastalPlacesLayer = layerRef.current;
    if (!coastalPlacesLayer) return;

    arcgisMap.map.layers.add(coastalPlacesLayer);
  }, [mapRef, layerRef]);

  return null;
}
