declare module '@mapbox/geojson-rewind' {
  import type {
    Geometry,
    GeometryCollection,
    Feature,
    FeatureCollection,
  } from 'geojson';

  type RewindTarget =
    | Geometry
    | GeometryCollection
    | Feature
    | FeatureCollection;

  /**
   * Rewinds GeoJSON polygon and multipolygon outer/inner rings to satisfy
   * RFC 7946 right-hand rule (when `clockwise = true`).
   */
  function rewind<T extends RewindTarget>(geojson: T, clockwise?: boolean): T;
  export default rewind;
}
