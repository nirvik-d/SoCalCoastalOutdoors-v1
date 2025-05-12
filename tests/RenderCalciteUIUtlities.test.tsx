import { describe, it, expect, vi } from "vitest";
import { handlePlaceChange } from "../src/components/RenderCalciteUI";

describe("handlePlaceChange", () => {
  it("calls view.goTo with the matching city graphic", () => {
    const mockGoTo = vi.fn();
    const mockViewRef = { current: { goTo: mockGoTo } };

    const event = { target: { value: "Santa Monica" } };
    const mockGraphic = {
      attributes: { CDTFA_CITY: "Santa Monica" },
      geometry: { type: "point", x: 0, y: 0 },
    };
    const mockLayer = { graphics: { items: [mockGraphic] } };

    handlePlaceChange(event, mockLayer, mockViewRef);

    expect(mockGoTo).toHaveBeenCalledWith(
      {
        target: mockGraphic.geometry,
        zoom: 12,
      },
      {
        duration: 1000,
        easing: "ease-in-out",
      }
    );
  });
});
