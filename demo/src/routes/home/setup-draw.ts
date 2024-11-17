import {
  TerraDraw,
  TerraDrawMapLibreGLAdapter,
  TerraDrawPolygonMode,
  ValidateNotSelfIntersecting,
} from "terra-draw";
import maplibregl from "maplibre-gl";

export const randomPolygonId = 'e2598bc5-82f3-4a1e-a683-c0ae4211ebdb'


export function setupDraw(map: maplibregl.Map) {
  return new TerraDraw({
    tracked: true,
    adapter: new TerraDrawMapLibreGLAdapter({
      map,
      coordinatePrecision: 9,
    }),
    modes: [
      new TerraDrawPolygonMode({
        // snapping: true,
        pointerDistance: 30,
        validation: (feature, { updateType }) => {
          if (updateType === "finish" || updateType === "commit") {
            return ValidateNotSelfIntersecting(feature);
          }
          return true
        },
        styles: {
          fillColor: ({ id }) => {
            if (id !== randomPolygonId) {
              return '#ff0000';
            }

            return '#add8e6'
          },
          outlineColor: ({ id }) => {
            if (id !== randomPolygonId) {
              return '#ffa07a';
            }

            return '#0000ff'
          },
          outlineWidth: 4,
          closingPointOutlineColor: ({ id }) => {
            return '#ffffff'
          },
          closingPointColor: ({ id }) => {
            return '#ffa07a'
          }
        }
      }),
    ],
  });
}
