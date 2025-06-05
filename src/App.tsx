import { useRef, useState } from "react";
import "./App.css";
import { AuthenticateEsriAPI } from "./components/Authentication";
import { FetchFeatureLayers } from "./components/FetchLayers";
import "@esri/calcite-components/components/calcite-shell";
import { RenderMap } from "./components/RenderMap";
import { DisplayCoastalPlaces } from "./components/DisplayCoastalPlaces";
import { RenderCalciteUI } from "./components/RenderCalciteUI";
import { DisplayOutdoors } from "./components/DisplayOutdoors";

function App() {
  const mapRef = useRef<any>(null),
    mapViewRef = useRef<any>(null),
    layerRef = useRef<any>(null);
  const [isDrawingComplete, setDrawingComplete] = useState<boolean>(false),
    [isLoadingComplete, setLoadingComplete] = useState<boolean>(false);

  function handleDrawingComplete(complete: boolean) {
    setDrawingComplete(complete);
  }

  function handleLoadingComplete(complete: boolean) {
    setLoadingComplete(complete);
  }

  console.log("Authentication complete.");

  if (isLoadingComplete) {
    console.log("Layer fetching complete.");
  }

  if (isDrawingComplete) {
    console.log("Map rendering complete.");
  }

  if (isLoadingComplete && isDrawingComplete) {
    console.log("Coastal places display complete.");
    console.log("Calcite UI rendering complete.");
    console.log("Outdoor display complete.");
  }

  return (
    <calcite-shell>
      <>
        <AuthenticateEsriAPI />
        <FetchFeatureLayers
          mapRef={mapRef}
          layerRef={layerRef}
          isLoadingComplete={handleLoadingComplete}
        />

        <RenderMap
          mapType="arcgis/topographic"
          mapCenter={[-117.9988, 33.6595]}
          mapZoom={8}
          mapRef={mapRef}
          mapViewRef={mapViewRef}
          isDrawingComplete={handleDrawingComplete}
        />

        {isLoadingComplete && isDrawingComplete && (
          <>
            <DisplayCoastalPlaces mapRef={mapRef} layerRef={layerRef} />
            <RenderCalciteUI mapViewRef={mapViewRef} layerRef={layerRef} />
            <DisplayOutdoors mapRef={mapRef} mapViewRef={mapViewRef} />
          </>
        )}
      </>
    </calcite-shell>
  );
}

export default App;
