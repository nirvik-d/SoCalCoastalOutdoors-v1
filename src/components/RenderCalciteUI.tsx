import "@esri/calcite-components/components/calcite-shell-panel";
import "@esri/calcite-components/components/calcite-combobox";
import "@esri/calcite-components/components/calcite-combobox-item";
import "@esri/calcite-components/components/calcite-label";
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-flow";
import "@esri/calcite-components/components/calcite-flow-item";
import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-notice";

interface CalciteUIProps {
  mapViewRef?: any;
  layerRef?: any;
}

export function RenderCalciteUI({ mapViewRef, layerRef }: CalciteUIProps) {
  const coastalPlacesLayer = layerRef.current;
  return (
    <>
      <calcite-shell-panel slot="panel-start" position="start" id="contents">
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
        <calcite-panel>
          <calcite-flow id="flow">
            <calcite-flow-item>
              <calcite-list id="results" label="">
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

export function handlePlaceChange(
  event: any,
  coastalPlacesLayer: any,
  mapViewRef: any
) {
  const selectedCity = event.target.value;
  if (!selectedCity || !coastalPlacesLayer) return;

  // Find the matching city graphic
  const cityGraphic = coastalPlacesLayer.graphics.items.find(
    (graphic: any) => graphic.attributes.CDTFA_CITY === selectedCity
  );

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
