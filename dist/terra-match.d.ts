import { LineString, Polygon, Position } from 'geojson';
type DistanceMetric = (p1: Position, p2: Position) => number;
export declare function terraMatch(P: Polygon, Q: Polygon, options?: {
    distanceMetric?: DistanceMetric;
    checkPermutations?: boolean;
    cleanRedundant?: boolean;
    decay?: 'linear' | 'exponential';
}): number;
/**
 * Compute discrete Fréchet distance between two polygon Position sequences
 */
export declare function frechetDistance(polygon1: Polygon | LineString, polygon2: Polygon | LineString, options?: {
    distanceMetric: DistanceMetric;
}): number;
export declare function exponentialDecayFunction(distance: number, maxDistance: number): number;
export declare function linearDecayFunction(distance: number, maxDistance: number): number;
export declare function generateGeometryCoordinatePermutations<T extends Polygon | LineString>(geometry: T): T[];
export {};
