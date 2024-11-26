import { terraMatch } from "./../src/terra-match";
import {
    polygonASquare,
    polygonATriangle,
    polygonADiamond,
    polygonAHexagon,
    polygonARhombus,
    polygonACircle,
    polygonAStar
} from "./../src/fixtures";
import * as turf from "@turf/turf";

const testPolygons = [
    polygonASquare,
    polygonATriangle,
    polygonADiamond,
    polygonAHexagon,
    polygonARhombus,
    polygonACircle,
    polygonAStar
]

const scaledUpPolygons = testPolygons.map((polygon) => turf.transformScale(polygon, 2))
const scaledUpTwoPolygons = testPolygons.map((polygon) => turf.transformScale(polygon, 1.5))
const scaledDownPolygons = testPolygons.map((polygon) => turf.transformScale(polygon, 0.5))
const scaledDownTwoPolygons = testPolygons.map((polygon) => turf.transformScale(polygon, 0.25))
const rotatedPolygons = testPolygons.map((polygon) => turf.transformRotate(polygon, 45))

console.time('benchmark');

for (let j = 0; j < testPolygons.length; j++) {
    const P = testPolygons[j];
    const Q = scaledUpPolygons[j];
    terraMatch(P.geometry, Q.geometry);
}

for (let j = 0; j < testPolygons.length; j++) {
    const P = testPolygons[j];
    const Q = scaledUpTwoPolygons[j];
    terraMatch(P.geometry, Q.geometry);
}

for (let j = 0; j < testPolygons.length; j++) {
    const P = testPolygons[j];
    const Q = scaledDownPolygons[j];
    terraMatch(P.geometry, Q.geometry);
}

for (let j = 0; j < testPolygons.length; j++) {
    const P = testPolygons[j];
    const Q = scaledDownTwoPolygons[j];
    terraMatch(P.geometry, Q.geometry);
}

for (let j = 0; j < testPolygons.length; j++) {
    const P = testPolygons[j];
    const Q = rotatedPolygons[j];
    terraMatch(P.geometry, Q.geometry);
}

console.timeEnd('benchmark');