# SoCal Coastal Outdoors Map

A web application providing interactive mapping for Southern California coastal areas using ArcGIS Maps SDK for JavaScript.

## Features

- **Interactive Mapping**: Dynamic map visualization for Southern California coastal regions
- **Custom Layers**: Feature layers and graphics layers for detailed data visualization
- **Authentication**: Secure ArcGIS API key management
- **Modern UI**: Clean and intuitive user interface with navigation controls
- **Reactive Components**: React-based components for map rendering and authentication
- **Environment Variables**: Secure API key management

## Screenshots

<img width="959" alt="image" src="https://github.com/user-attachments/assets/23260934-ca9d-450d-b70e-f884f938d567" />

*Interactive Southern California coastal map*

## Prerequisites

- NodeJS
- Vite
- ArcGIS API Key (set in environment variables)

## Detailed Implementation Guide

### Create a New Project

1. Start by creating a Vite project.

   ```bash
   npm create vite@latest
   ```

   Follow the on-screen instructions using React and Typescript.

Navigate into the project directory:

```bash
cd <your-project-name>
npm install
```

2. Install required dependencies:

   ```bash
   npm install @arcgis/map-components @testing-library/react @testing-library/jest-dom jsdom vitest
   ```

### Create the required components

1. Create the RenderMap component in `src/components/RenderMap.tsx`:

```tsx
import { useEffect } from "react";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-search";

// State variables for Render Map
interface RenderMapProps {
  mapType?: any;
  mapCenter?: any;
  mapZoom?: any;
  mapRef?: any;
  mapViewRef?: any;
  isDrawingComplete: (complete: boolean) => void;
}

// Render Map component
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
    // Render the map
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
```

2. Create the Authentication component in `src/components/Authentication.tsx`:

```tsx
// Import ArcGIS configuration
import esriConfig from "@arcgis/core/config";

// Authentication component
export function AuthenticateEsriAPI() {
  // Set the ArcGIS API key from environment variables
  esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;
  return null;
}
```

3. Create the FetchLayers component in `src/components/FetchLayers.tsx`:

```tsx
import { useEffect } from "react";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";

// State variables for Fetch Feature Layers
interface DisplayFeatureLayersProps {
  mapRef?: any;
  layerRef?: any;
  isLoadingComplete: (complete: boolean) => void;
}

// Fetch Feature Layers component
export function FetchFeatureLayers({
  mapRef,
  layerRef,
  isLoadingComplete,
}: DisplayFeatureLayersProps) {
  useEffect(() => {
    async function loadFeatures() {
      // Create a new graphics layer
      const coastalCitiesGraphicsLayer = new GraphicsLayer();

      // Create a new feature layer for beach access points
      const beachAccessPoints = new FeatureLayer({
        url: "https://services9.arcgis.com/wwVnNW92ZHUIr0V0/arcgis/rest/services/AccessPoints/FeatureServer/0/",
        outFields: ["*"],
        definitionExpression: `COUNTY IN ('Santa Barbara', 'Ventura', 'Los Angeles', 'Orange', 'San Diego', 'San Luis Obispo', 'Imperial')`,
      });

      // Create a new feature layer for coastal buffer
      const coastalBufferLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/uknczv4rpevve42E/arcgis/rest/services/California_County_Boundaries_and_Identifiers_with_Coastal_Buffers/FeatureServer/1",
        definitionExpression:
          "OFFSHORE IS NOT NULL AND CDTFA_COUNTY in ('Santa Barbara County', 'Ventura County', 'Los Angeles County', 'Orange County', 'San Diego County', 'San Luis Obispo County', 'Imperial County')",
        outFields: ["*"],
      });

      // Create a new feature layer for coastal cities
      const coastalCitiesLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/uknczv4rpevve42E/arcgis/rest/services/California_Cities_and_Identifiers_Blue_Version_view/FeatureServer/2/",
        outFields: ["*"],
      });

      // Load the layers
      beachAccessPoints.load();
      coastalBufferLayer.load();
      coastalCitiesLayer.load();

      // Query the coastal buffer and beach access points
      const [coastalBufferResult, beachAccessResult] = await Promise.all([
        coastalBufferLayer.queryFeatures(),
        beachAccessPoints.queryFeatures(),
      ]);

      const coastalCitiesResult = [];

      // Query the coastal cities for each coastal buffer
      for (const feature of coastalBufferResult.features) {
        coastalCitiesResult.push(
          coastalCitiesLayer.queryFeatures({
            geometry: feature.geometry,
            spatialRelationship: "intersects",
            returnGeometry: true,
            outFields: ["*"],
          })
        );
      }

      // Query the coastal cities for each beach access point
      for (const feature of beachAccessResult.features) {
        coastalCitiesResult.push(
          coastalCitiesLayer.queryFeatures({
            geometry: feature.geometry,
            spatialRelationship: "intersects",
            returnGeometry: true,
            outFields: ["*"],
          })
        );
      }

      // Wait for all coastal cities results
      const results = await Promise.all(coastalCitiesResult);
      const allCityFeatures = results.flatMap((r) => r.features);

      // Remove duplicate cities
      const alreadyExists = new Set<any>();
      const filteredCityFeatures = allCityFeatures.filter((feature: any) => {
        const cityName = feature.attributes.CDTFA_CITY;

        if (alreadyExists.has(cityName)) {
          return false;
        } else {
          alreadyExists.add(cityName);
          return true;
        }
      });

      // Create graphics for the coastal cities
      const coastalCitiesGraphics = createPlaceGraphics(filteredCityFeatures);
      coastalCitiesGraphicsLayer.addMany(coastalCitiesGraphics);

      // Add the graphics layer to the map
      layerRef.current = coastalCitiesGraphicsLayer;
      isLoadingComplete(true);
    }

    // Load the features
    loadFeatures();
  }, [mapRef]);

  return null;
}

// Create graphics for the coastal cities
export function createPlaceGraphics(placeFeatures: any) {
  return placeFeatures.map((placeFeature: any) => {
    return new Graphic({
      geometry: placeFeature.geometry,
      attributes: placeFeature.attributes,
      symbol: {
        type: "simple-fill",
        color: [0, 120, 255, 0.5],
        outline: {
          color: [0, 0, 0, 0.6],
          width: 1,
        },
      },
    });
  });
}
```

4. Create the DisplayCoastalPlaces component in `src/components/DisplayCoastalPlaces.tsx`:

```tsx
import { useEffect } from "react";

// State variables for Display Coastal Places
interface DisplayPlacesProps {
  mapRef?: any;
  layerRef?: any;
}

// Display Coastal Places component
export function DisplayCoastalPlaces({ mapRef, layerRef }: DisplayPlacesProps) {
  useEffect(() => {
    const arcgisMap = mapRef.current;
    if (!arcgisMap) return;

    // Add the coastal places layer to the map
    const coastalPlacesLayer = layerRef.current;
    if (!coastalPlacesLayer) return;

    // Add the layer to the map
    arcgisMap.map.layers.add(coastalPlacesLayer);
  }, [mapRef, layerRef]);

  return null;
}
```

5. Create the RenderCalciteUI component in `src/components/RenderCalciteUI.tsx`:

```tsx
import "@esri/calcite-components/components/calcite-shell-panel";
import "@esri/calcite-components/components/calcite-combobox";
import "@esri/calcite-components/components/calcite-combobox-item";
import "@esri/calcite-components/components/calcite-label";
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-flow";
import "@esri/calcite-components/components/calcite-flow-item";
import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-notice";

// State variables for Render Calcite UI
interface CalciteUIProps {
  mapViewRef?: any;
  layerRef?: any;
}

// Render Calcite UI component
export function RenderCalciteUI({ mapViewRef, layerRef }: CalciteUIProps) {
  const coastalPlacesLayer = layerRef.current;
  return (
    <>
      {/* Render the Calcite UI */}
      <calcite-shell-panel slot="panel-start" position="start" id="contents">
        {/* Render the combobox */}
        <calcite-combobox
          id="categorySelect"
          placeholder="Pick a coastal city or town"
          overlay-positioning="fixed"
          selection-mode="single"
          label=""
          oncalciteComboboxChange={(e: any) => {
            const selectedValue = e.target.selectedItems[0]?.value;
            if (selectedValue) {
              handlePlaceChange(
                { target: { value: selectedValue } },
                coastalPlacesLayer,
                mapViewRef
              );
            }
          }}
        >
          {[...coastalPlacesLayer?.graphics?.items]
            .sort((a, b) =>
              a.attributes.CDTFA_CITY.localeCompare(b.attributes.CDTFA_CITY)
            )
            .map((city: any) => (
              <calcite-combobox-item
                key={city.attributes.CDTFA_CITY}
                value={city.attributes.CDTFA_CITY}
                heading={city.attributes.CDTFA_CITY}
              ></calcite-combobox-item>
            ))}
        </calcite-combobox>
        {/* Render the panel */}
        <calcite-panel>
          <calcite-flow id="flow">
            <calcite-flow-item>
              {/* Render the list */}
              <calcite-list id="results" label="">
                {/* Render the notice */}
                <calcite-notice open>
                  <div slot="message">
                    Click on the map to search for nearby places
                  </div>
                </calcite-notice>
              </calcite-list>
            </calcite-flow-item>
          </calcite-flow>
        </calcite-panel>
      </calcite-shell-panel>
    </>
  );
}

// Handle place change
export function handlePlaceChange(
  event: any,
  coastalPlacesLayer: any,
  mapViewRef: any
) {
  // Get the selected city
  const selectedCity = event.target.value;
  if (!selectedCity || !coastalPlacesLayer) return;

  // Find the matching city graphic
  const cityGraphic = coastalPlacesLayer.graphics.items.find(
    (graphic: any) => graphic.attributes.CDTFA_CITY === selectedCity
  );

  // Zoom to the city graphic
  if (cityGraphic && mapViewRef?.current) {
    mapViewRef.current.goTo(
      {
        target: cityGraphic.geometry,
        zoom: 12,
      },
      {
        duration: 1000,
        easing: "ease-in-out",
      }
    );
  }
}
```

6. Create the DisplayOutdoors component in `src/components/DisplayOutdoors.tsx`:

```tsx
import { useEffect } from "react";
import FetchPlaceParameters from "@arcgis/core/rest/support/FetchPlaceParameters";
import PlacesQueryParameters from "@arcgis/core/rest/support/PlacesQueryParameters";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Circle from "@arcgis/core/geometry/Circle";
import Graphic from "@arcgis/core/Graphic";
import * as places from "@arcgis/core/rest/places";
import "@esri/calcite-components/components/calcite-list-item";
import "@esri/calcite-components/components/calcite-flow-item";
import "@esri/calcite-components/components/calcite-icon";
import "@esri/calcite-components/components/calcite-block";

// State variables for Display Outdoors
interface OutdoorsProps {
  mapRef?: any;
  mapViewRef?: any;
}

// Display Outdoors component
export function DisplayOutdoors({ mapRef, mapViewRef }: OutdoorsProps) {
  useEffect(() => {
    let infoPanel: any;
    let clickPoint: any;
    let category = "4d4b7105d754a06377d81259";

    // Create the layers
    const placesLayer = new GraphicsLayer({
      id: "placesLayer",
    });

    const bufferLayer = new GraphicsLayer({
      id: "bufferLayer",
    });

    // Get the elements
    const categorySelect: any = document.getElementById("categorySelect");
    const resultPanel: any = document.getElementById("results");
    const flow: any = document.getElementById("flow");

    // Run the places service on the map
    mapViewRef.current.on("click", async (event: any) => {
      clearGraphics(placesLayer, bufferLayer, resultPanel, infoPanel);
      clickPoint = {} as any;
      clickPoint.type = "point";
      clickPoint.longitude = Math.round(event.mapPoint.longitude * 1000) / 1000;
      clickPoint.latitude = Math.round(event.mapPoint.latitude * 1000) / 1000;
      clickPoint &&
        showPlaces(
          clickPoint,
          bufferLayer,
          placesLayer,
          category,
          resultPanel,
          infoPanel,
          mapViewRef,
          flow
        );
    });

    // Run the places service on the selected category
    categorySelect?.addEventListener("calciteComboboxChange", async () => {
      clearGraphics(placesLayer, bufferLayer, resultPanel, infoPanel);
      clickPoint &&
        showPlaces(
          clickPoint,
          bufferLayer,
          placesLayer,
          category,
          resultPanel,
          infoPanel,
          mapViewRef,
          flow
        );
    });

    // Add the layers to the map
    mapRef.current.map.addMany([bufferLayer, placesLayer]);
  });

  return null;
}

// Clear the graphics
export function clearGraphics(
  placesLayer: any,
  bufferLayer: any,
  resultPanel: any,
  infoPanel: any
) {
  placesLayer?.removeAll();
  bufferLayer?.removeAll();
  resultPanel.innerHTML = "";
  if (infoPanel) infoPanel.remove();
}

// Show the places
export async function showPlaces(
  clickPoint: any,
  bufferLayer: any,
  placesLayer: any,
  category: any,
  resultPanel: any,
  infoPanel: any,
  mapViewRef: any,
  flow: any
) {
  // Create a circle geometry
  const circleGeometry = new Circle({
    center: clickPoint,
    geodesic: true,
    numberOfPoints: 100,
    radius: 500,
    radiusUnit: "meters",
  });

  // Create a circle graphic
  const circleGraphic = new Graphic({
    geometry: circleGeometry,
    symbol: {
      type: "simple-fill",
      style: "solid",
      color: [3, 140, 255, 0.1],
      outline: {
        width: 1,
        color: [3, 140, 255],
      },
    },
  });

  // Add the circle graphic to the buffer layer
  bufferLayer.graphics.add(circleGraphic);

  // Run the places service
  const placesQueryParameters = new PlacesQueryParameters({
    categoryIds: [category],
    radius: 500,
    point: clickPoint,
    icon: "png",
  });

  // Run the places service
  const results = await places.queryPlacesNearPoint(placesQueryParameters);

  // Tabulate the results
  tabulateResults(
    results,
    placesLayer,
    resultPanel,
    infoPanel,
    mapViewRef,
    flow
  );
}

// Tabulate the results
export async function tabulateResults(
  results: any,
  placesLayer: any,
  resultPanel: any,
  infoPanel: any,
  mapViewRef: any,
  flow: any
) {
  // Add the results to the list
  results.results.forEach((placeResult: any) => {
    addResult(
      placeResult,
      placesLayer,
      resultPanel,
      infoPanel,
      mapViewRef,
      flow
    );
  });
}

// Add the result to the list
export async function addResult(
  placeResult: any,
  placesLayer: any,
  resultPanel: any,
  infoPanel: any,
  mapViewRef: any,
  flow: any
) {

  // Add the place graphic to the places layer
  const placeGraphic = new Graphic({
    geometry: placeResult.location,
    symbol: {
      type: "picture-marker",
      url: placeResult.icon.url,
      width: 15,
      height: 15,
    },
  });

  // Add the place graphic to the places layer
  placesLayer.graphics.add(placeGraphic);

  const infoDiv = document.createElement("calcite-list-item");
  infoDiv.label = placeResult.name;
  infoDiv.description = `${placeResult.categories[0].label} - ${Number(
    (placeResult.distance / 1000).toFixed(1)
  )} km`;

  // Add the click event to the info div
  infoDiv.addEventListener("click", async () => {
    mapViewRef.current.openPopup({
      title: placeResult.name,
      location: placeResult.location,
    });

    // Zoom to the place graphic
    mapViewRef.current.goTo(placeGraphic);

    // Get the details of the place
    const fetchPlaceParameters = new FetchPlaceParameters({
      placeId: placeResult.placeId,
      requestedFields: ["all"],
    });
    getDetails(fetchPlaceParameters, infoPanel, mapViewRef, flow);
  });

  resultPanel.appendChild(infoDiv);
}

// Get the details of the place
export async function getDetails(
  fetchPlaceParameters: any,
  infoPanel: any,
  mapViewRef: any,
  flow: any
) {
  const result = await places.fetchPlace(fetchPlaceParameters);
  const placeDetails = result.placeDetails;

  // Create the info panel
  infoPanel = document.createElement("calcite-flow-item");
  flow.append(infoPanel);
  infoPanel.heading = placeDetails.name;
  infoPanel.description = placeDetails.categories[0].label;

  // Set the flow items
  const flowItems = flow.querySelectorAll("calcite-flow-item");

  flowItems.forEach((item: any) => (item.selected = false));

  infoPanel.selected = true;

  // Set the attributes
  setAttribute(
    "Address",
    "map-pin",
    placeDetails.address.streetAddress,
    infoPanel
  );
  setAttribute(
    "Phone",
    "mobile",
    placeDetails.contactInfo.telephone,
    infoPanel
  );
  setAttribute(
    "Email",
    "email-address",
    placeDetails.contactInfo.email,
    infoPanel
  );
  setAttribute(
    "Facebook",
    "speech-bubble-social",
    placeDetails.socialMedia.facebookId
      ? `www.facebook.com/${placeDetails.socialMedia.facebookId}`
      : null,
    infoPanel
  );
  setAttribute(
    "X",
    "speech-bubbles",
    placeDetails.socialMedia.twitter
      ? `www.x.com/${placeDetails.socialMedia.twitter}`
      : null,
    infoPanel
  );
  setAttribute(
    "Instagram",
    "camera",
    placeDetails.socialMedia.instagram
      ? `www.instagram.com/${placeDetails.socialMedia.instagram}`
      : null,
    infoPanel
  );

  // Add the back event to the info panel
  infoPanel.addEventListener("calciteFlowItemBack", async () => {
    mapViewRef.current.closePopup();
    infoPanel.remove();
  });
}

// Set the attribute
export function setAttribute(
  heading: any,
  icon: any,
  validValue: any,
  infoPanel: any
) {
  // Set the attribute
  if (validValue) {
    const element = document.createElement("calcite-block");
    element.heading = heading;
    element.description = validValue;
    const attributeIcon = document.createElement("calcite-icon");
    attributeIcon.icon = icon;
    attributeIcon.slot = "icon";
    attributeIcon.scale = "m";
    element.appendChild(attributeIcon);
    infoPanel.appendChild(element);
  }
}
```

7. Update `src/App.tsx`:

```tsx
import { useRef, useState } from "react";
import "./App.css";
import { AuthenticateEsriAPI } from "./components/Authentication";
import { FetchFeatureLayers } from "./components/FetchLayers";
import "@esri/calcite-components/components/calcite-shell";
import { RenderMap } from "./components/RenderMap";
import { DisplayCoastalPlaces } from "./components/DisplayCoastalPlaces";
import { RenderCalciteUI } from "./components/RenderCalciteUI";
import { DisplayOutdoors } from "./components/DisplayOutdoors";

// Main App component
function App() {
  // Refs for map and map view
  const mapRef = useRef<any>(null),
    mapViewRef = useRef<any>(null),
    layerRef = useRef<any>(null);

  // State variables for drawing and loading
  const [isDrawingComplete, setDrawingComplete] = useState<boolean>(false),
    [isLoadingComplete, setLoadingComplete] = useState<boolean>(false);

  // Handle drawing complete
  function handleDrawingComplete(complete: boolean) {
    setDrawingComplete(complete);
  }

  // Handle loading complete
  function handleLoadingComplete(complete: boolean) {
    setLoadingComplete(complete);
  }

  // Log messages
  console.log("Authentication complete.");

  // Log messages
  if (isLoadingComplete) {
    console.log("Layer fetching complete.");
  }

  // Log messages
  if (isDrawingComplete) {
    console.log("Map rendering complete.");
  }

  // Log messages
  if (isLoadingComplete && isDrawingComplete) {
    console.log("Coastal places display complete.");
    console.log("Calcite UI rendering complete.");
    console.log("Outdoor display complete.");
  }

  return (
    // Return the app
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
```

### Add Styles

1. Update `src/App.css`:

```css
@import url("https://js.arcgis.com/4.32/@arcgis/core/assets/esri/themes/dark/main.css");
@import url("https://js.arcgis.com/calcite-components/3.0.3/calcite.css");
@import url("https://js.arcgis.com/map-components/4.32/arcgis-map-components.css");

html,
body,
#root {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
}

arcgis-map {
  height: 100vh;
}
```

### Run the Application

1. Start the development server:

```bash
npm run dev
```

2. Go to `http://localhost:5173`

## Usage

1. **View the Map**
   - Open the application to see the Southern California coastal map
   - The map displays detailed coastal features
   - Use the zoom control in top-right to navigate

2. **Explore Features**
   - The map includes multiple layers of coastal data
   - Feature layers provide detailed information
   - Graphics layers enhance visualization

3. **Authentication**
   - The application securely handles ArcGIS API authentication
   - API key is loaded from environment variables
   - Authentication is handled automatically

4. **Map Navigation**
   - Use standard map controls:
     - Zoom in/out with the top-right control
     - Pan to view different areas
     - Click to interact with map features
