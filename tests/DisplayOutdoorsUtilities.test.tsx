import { describe, it, expect, vi } from "vitest";
import {
  addResult,
  clearGraphics,
  getDetails,
  setAttribute,
  showPlaces,
  tabulateResults,
} from "../src/components/DisplayOutdoors";
import PlacesQueryResult from "@arcgis/core/rest/support/PlacesQueryResult";
import PlaceResult from "@arcgis/core/rest/support/PlaceResult";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import FetchPlaceParameters from "@arcgis/core/rest/support/FetchPlaceParameters";
import PlacesQueryParameters from "@arcgis/core/rest/support/PlacesQueryParameters";

describe("DisplayOutdoors Component", () => {
  const placesLayer = new GraphicsLayer();
  const bufferLayer = new GraphicsLayer();
  const resultPanel = document.createElement("div");
  const category = "4d4b7105d754a06377d81259";
  const infoPanel = document.createElement("div");
  const mapViewRef = { current: null };
  const flow = document.createElement("flow");

  const clickPoint = {} as any;
  clickPoint.type = "point";
  clickPoint.longitude = 0;
  clickPoint.latitude = 0;

  const heading = "";
  const icon = "";
  const validValue = "";
  const fetchPlaceParameters = new FetchPlaceParameters();

  it("clears the graphics", () => {
    clearGraphics(placesLayer, bufferLayer, resultPanel, infoPanel);

    expect(placesLayer.graphics.length).toBe(0);
    expect(bufferLayer.graphics.length).toBe(0);
    expect(resultPanel.innerHTML).toBe("");
    expect(infoPanel.children.length).toBe(0);
  });

  it("shows places", () => {
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

    expect(bufferLayer.graphics.length).toBeGreaterThan(0);
  });

  it("gets place details", () => {
    const result = getDetails(
      fetchPlaceParameters,
      infoPanel,
      mapViewRef,
      flow
    );

    expect(result).toBeDefined();
  });

  it("sets the attributes", () => {
    setAttribute(heading, icon, null, infoPanel);

    expect(heading).toBe("");
    expect(icon).toBe("");
    expect(validValue).toBe("");
    expect(infoPanel.children.length).toBeGreaterThanOrEqual(0);
  });
});
