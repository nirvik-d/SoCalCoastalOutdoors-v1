import { useEffect } from "react";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";

interface DisplayFeatureLayersProps {
  mapRef?: any;
  layerRef?: any;
  isLoadingComplete: (complete: boolean) => void;
}

const alreadyExists = new Set<any>();

export function FetchFeatureLayers({
  mapRef,
  layerRef,
  isLoadingComplete,
}: DisplayFeatureLayersProps) {
  useEffect(() => {
    async function loadFeatures() {
      const coastalCitiesGraphicsLayer = new GraphicsLayer();

      const beachAccessPoints = new FeatureLayer({
        url: "https://services9.arcgis.com/wwVnNW92ZHUIr0V0/arcgis/rest/services/AccessPoints/FeatureServer/0/",
        outFields: ["*"],
        definitionExpression: `COUNTY IN ('Santa Barbara', 'Ventura', 'Los Angeles', 'Orange', 'San Diego', 'San Luis Obispo', 'Imperial')`,
      });

      const coastalCitiesLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/uknczv4rpevve42E/arcgis/rest/services/California_Cities_and_Identifiers_Blue_Version_view/FeatureServer/2/",
        outFields: ["*"],
      });

      await beachAccessPoints.load();
      await coastalCitiesLayer.load();

      const beachAccessResult = await beachAccessPoints.queryFeatures();
      if (!beachAccessResult.features.length) {
        console.error("No beach access found!");
        return;
      }

      for (const beachAccessFeature of beachAccessResult.features) {
        const coastalCitiesResult = await coastalCitiesLayer.queryFeatures({
          where:
            "CDTFA_COUNTY in ('Santa Barbara County', 'Ventura County', 'Los Angeles County', 'Orange County', 'San Diego County', 'San Luis Obispo County', 'Imperial County')",
          geometry: beachAccessFeature.geometry,
          spatialRelationship: "intersects",
          returnGeometry: true,
          outFields: ["*"],
        });

        const filteredCityFeatures = coastalCitiesResult.features.filter(
          (feature) => {
            const cityName = feature.attributes.CDTFA_CITY;

            if (alreadyExists.has(cityName)) {
              return false;
            } else {
              alreadyExists.add(cityName);
              return true;
            }
          }
        );

        const coastalCitiesGraphics = createPlaceGraphics(filteredCityFeatures);
        coastalCitiesGraphicsLayer.addMany(coastalCitiesGraphics);
      }

      layerRef.current = coastalCitiesGraphicsLayer;
      isLoadingComplete(true);
    }

    loadFeatures();
  }, [mapRef]);

  return null;
}

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
      // popupTemplate: {
      //   title: "{CDTFA_CITY}",
      //   content: `
      //     <b>Census Place Type:</b> {CENSUS_PLACE_TYPE}<br/>
      //     <b>County:</b> {CDTFA_COUNTY}
      //   `,
      // },
    });
  });
}
