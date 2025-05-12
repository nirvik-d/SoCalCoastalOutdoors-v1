import { describe, it, expect, vi } from "vitest";
import { createPlaceGraphics } from "../src/components/FetchLayers";
import Polygon from "@arcgis/core/geometry/Polygon";

describe("createPlaceGraphics", () => {
  it("creates Graphic instances with correct structure", () => {
    const polygon = new Polygon({
      rings: [
        [
          [-118.5, 33.5],
          [-118.5, 33.6],
          [-118.4, 33.6],
          [-118.4, 33.5],
          [-118.5, 33.5], // closed ring
        ],
      ],
      spatialReference: { wkid: 4326 },
    });

    const features = [
      {
        geometry: polygon,
        attributes: {
          CDTFA_CITY: "Laguna Beach",
          CENSUS_PLACE_TYPE: "City",
          CDTFA_COUNTY: "Orange",
        },
      },
    ];

    const graphics = createPlaceGraphics(features);
    expect(graphics).toHaveLength(1);
    expect(graphics[0].geometry).toEqual(features[0].geometry);
    expect(graphics[0].attributes).toEqual(features[0].attributes);
  });
});
