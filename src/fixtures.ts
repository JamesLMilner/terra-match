import { Feature, Polygon } from "geojson";
import * as turf from '@turf/turf';

export const polygonASquare: Feature<Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 1],
                [0, 0]
            ]
        ]
    }
};

export const polygonADiamond: Feature<Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [0.5, -0.2071],
                [1.2071, 0.5],
                [0.5, 1.2071],
                [-0.2071, 0.5],
                [0.5, -0.2071]
            ]
        ]
    }
};

export const polygonATriangle: Feature<Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [3, 3],
                [4, 3],
                [4, 4],
                [3, 3]
            ]
        ]
    }
};

export const polygonAHexagon: Feature<Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [0, 1],                // Top
                [0.866, 0.5],          // Top-right
                [0.866, -0.5],         // Bottom-right
                [0, -1],               // Bottom
                [-0.866, -0.5],        // Bottom-left
                [-0.866, 0.5],         // Top-left
                [0, 1]                 // Closing point
            ]
        ]
    }
};

export const polygonARhombus: Feature<Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [0, 0.5],     // Top
                [1, 0],       // Right
                [0, -0.5],    // Bottom
                [-1, 0],      // Left
                [0, 0.5]      // Closing point
            ]
        ]
    }
};

export const polygonACircle: Feature<Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            Array.from({ length: 33 }, (_, i) => {
                const angle = (i * 2 * Math.PI) / 32;  // Divide the circle into 32 segments
                return [Math.cos(angle), Math.sin(angle)]; // x and y coordinates
            }).concat([[1, 0]]) // Closing point
        ]
    }
};

export const polygonAStar: Feature<Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [Math.cos(Math.PI / 2) * 1, Math.sin(Math.PI / 2) * 1],                 // Outer point 1 (North)
                [Math.cos(Math.PI / 2 + Math.PI / 5) * 0.5, Math.sin(Math.PI / 2 + Math.PI / 5) * 0.5], // Inner point 1
                [Math.cos(Math.PI / 2 + 2 * Math.PI / 5) * 1, Math.sin(Math.PI / 2 + 2 * Math.PI / 5) * 1], // Outer point 2
                [Math.cos(Math.PI / 2 + 3 * Math.PI / 5) * 0.5, Math.sin(Math.PI / 2 + 3 * Math.PI / 5) * 0.5], // Inner point 2
                [Math.cos(Math.PI / 2 + 4 * Math.PI / 5) * 1, Math.sin(Math.PI / 2 + 4 * Math.PI / 5) * 1], // Outer point 3
                [Math.cos(Math.PI / 2 + 5 * Math.PI / 5) * 0.5, Math.sin(Math.PI / 2 + 5 * Math.PI / 5) * 0.5], // Inner point 3
                [Math.cos(Math.PI / 2 + 6 * Math.PI / 5) * 1, Math.sin(Math.PI / 2 + 6 * Math.PI / 5) * 1], // Outer point 4
                [Math.cos(Math.PI / 2 + 7 * Math.PI / 5) * 0.5, Math.sin(Math.PI / 2 + 7 * Math.PI / 5) * 0.5], // Inner point 4
                [Math.cos(Math.PI / 2 + 8 * Math.PI / 5) * 1, Math.sin(Math.PI / 2 + 8 * Math.PI / 5) * 1], // Outer point 5
                [Math.cos(Math.PI / 2 + 9 * Math.PI / 5) * 0.5, Math.sin(Math.PI / 2 + 9 * Math.PI / 5) * 0.5], // Inner point 5
                [Math.cos(Math.PI / 2) * 1, Math.sin(Math.PI / 2) * 1]              // Close back to Outer point 1
            ]
        ]
    }
};


export const polygonB: Feature<Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [0, 0],
                [5, 0],
                [5, 5],
                [0, 5],
                [0, 0]
            ]
        ]
    }
};

export const smallPolygonB: Feature<Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [0, 0],
                [0.5, 0],
                [0.5, 0.5],
                [0, 0.5],
                [0, 0]
            ]
        ]
    }
};

export const irregularPolygonB: Feature<Polygon> = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "Polygon",
        coordinates: [
            [
                [0, 0],
                [1.25, 0],
                [0.75, 0.75],
                [1.25, 1.25],
                [0, 1.25],
                [0, 0]
            ]
        ]
    }
};

export const testPolygons = {
    'square': polygonASquare,
    'triangle': polygonATriangle,
    'diamond': polygonADiamond,
    'hexagon': polygonAHexagon,
    'rhombus': polygonARhombus,
    'circle': polygonACircle,
    'star': polygonAStar,
    'irregular': irregularPolygonB,
} as const
export const polygons = Object.keys(testPolygons) as (keyof typeof testPolygons)[]

const createLineString = (p: Feature<Polygon>) => turf.lineString(p.geometry.coordinates[0].slice(0, -1))

export const testLineStrings = {
    'square': createLineString(polygonASquare),
    'triangle': createLineString(polygonATriangle),
    'diamond': createLineString(polygonADiamond),
    'hexagon': createLineString(polygonAHexagon),
    'rhombus': createLineString(polygonARhombus),
    'circle': createLineString(polygonACircle),
    'star': createLineString(polygonAStar),
    'irregular': createLineString(irregularPolygonB),
} as const
export const lineStrings = Object.keys(testLineStrings) as (keyof typeof testLineStrings)[]

