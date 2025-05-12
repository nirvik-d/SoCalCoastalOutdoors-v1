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

interface OutdoorsProps {
  mapRef?: any;
  mapViewRef?: any;
}

export function DisplayOutdoors({ mapRef, mapViewRef }: OutdoorsProps) {
  useEffect(() => {
    let infoPanel: any;
    let clickPoint: any;
    let category = "4d4b7105d754a06377d81259";

    const placesLayer = new GraphicsLayer({
      id: "placesLayer",
    });

    const bufferLayer = new GraphicsLayer({
      id: "bufferLayer",
    });

    const categorySelect: any = document.getElementById("categorySelect");
    const resultPanel: any = document.getElementById("results");
    const flow: any = document.getElementById("flow");

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

    mapRef.current.map.addMany([bufferLayer, placesLayer]);
  });

  return null;
}

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
  const circleGeometry = new Circle({
    center: clickPoint,
    geodesic: true,
    numberOfPoints: 100,
    radius: 500,
    radiusUnit: "meters",
  });
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
  bufferLayer.graphics.add(circleGraphic);

  const placesQueryParameters = new PlacesQueryParameters({
    categoryIds: [category],
    radius: 500,
    point: clickPoint,
    icon: "png",
  });
  const results = await places.queryPlacesNearPoint(placesQueryParameters);
  tabulateResults(
    results,
    placesLayer,
    resultPanel,
    infoPanel,
    mapViewRef,
    flow
  );
}

export async function tabulateResults(
  results: any,
  placesLayer: any,
  resultPanel: any,
  infoPanel: any,
  mapViewRef: any,
  flow: any
) {
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

export async function addResult(
  placeResult: any,
  placesLayer: any,
  resultPanel: any,
  infoPanel: any,
  mapViewRef: any,
  flow: any
) {
  const placeGraphic = new Graphic({
    geometry: placeResult.location,
    symbol: {
      type: "picture-marker",
      url: placeResult.icon.url,
      width: 15,
      height: 15,
    },
  });
  placesLayer.graphics.add(placeGraphic);

  const infoDiv = document.createElement("calcite-list-item");
  infoDiv.label = placeResult.name;
  infoDiv.description = `${placeResult.categories[0].label} - ${Number(
    (placeResult.distance / 1000).toFixed(1)
  )} km`;
  infoDiv.addEventListener("click", async () => {
    mapViewRef.current.openPopup({
      title: placeResult.name,
      location: placeResult.location,
    });
    mapViewRef.current.goTo(placeGraphic);

    const fetchPlaceParameters = new FetchPlaceParameters({
      placeId: placeResult.placeId,
      requestedFields: ["all"],
    });
    getDetails(fetchPlaceParameters, infoPanel, mapViewRef, flow);
  });

  resultPanel.appendChild(infoDiv);
}

export async function getDetails(
  fetchPlaceParameters: any,
  infoPanel: any,
  mapViewRef: any,
  flow: any
) {
  const result = await places.fetchPlace(fetchPlaceParameters);
  const placeDetails = result.placeDetails;

  infoPanel = document.createElement("calcite-flow-item");
  flow.append(infoPanel);
  infoPanel.heading = placeDetails.name;
  infoPanel.description = placeDetails.categories[0].label;
  const flowItems = flow.querySelectorAll("calcite-flow-item");

  flowItems.forEach((item: any) => (item.selected = false));

  infoPanel.selected = true;

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
  infoPanel.addEventListener("calciteFlowItemBack", async () => {
    mapViewRef.current.closePopup();
    infoPanel.remove();
  });
}

export function setAttribute(
  heading: any,
  icon: any,
  validValue: any,
  infoPanel: any
) {
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
