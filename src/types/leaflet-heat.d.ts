declare module "leaflet.heat" {
  import * as L from "leaflet";
  export function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: any
  ): L.Layer;
}

declare namespace L {
  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: any
  ): L.Layer;
}
