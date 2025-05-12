import { describe, it, expect, vi } from "vitest";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Map from "@arcgis/core/Map";
import { render } from "@testing-library/react";
import { DisplayCoastalPlaces } from "../src/components/DisplayCoastalPlaces";
import React from "react";

describe("DisplayCoastaPlaces component", () => {
  it("displays the correct coastal places", () => {
    const layer = new GraphicsLayer({});
    const map = new Map({
      basemap: "arcgis/navigation",
    });

    const mapRef = { current: { map: map } };
    const layerRef = { current: { layer: layer } };

    render(<DisplayCoastalPlaces mapRef={mapRef} layerRef={layerRef} />);
  });
});
