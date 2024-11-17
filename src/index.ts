import { Polygon, Position } from 'geojson';
import * as turf from '@turf/turf';

type DistanceMetric = (p1: Position, p2: Position) => number

function haversineDistance(p1: Position, p2: Position): number {
    const [lat1, lon1] = p1;
    const [lat2, lon2] = p2;
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}

export function terraMatch(P: Polygon, Q: Polygon, options: {
    distanceMetric?: DistanceMetric,
    checkPermutations?: boolean,
    cleanRedundant?: boolean,
    decay?: 'linear' | 'exponential'
} = {}): number {
    const {
        distanceMetric = haversineDistance,
        checkPermutations = true,
        cleanRedundant = true,
        decay = 'exponential'
    } = options

    const bbox = turf.bbox({
        type: "FeatureCollection", features: [
            { type: "Feature", geometry: P, properties: {} },
            { type: "Feature", geometry: Q, properties: {} }
        ]
    });

    if (cleanRedundant) {
        turf.cleanCoords(Q, { mutate: true });
    }

    const QPermutations = checkPermutations ? generatePolygonCoordinatePermutations(Q) : [Q];
    const QWithPermutations = [Q, ...QPermutations]

    let smallestDistance = Infinity;

    while (QWithPermutations.length > 0) {
        const permutedQ: Polygon = QWithPermutations.pop() as Polygon;
        const distance = frechetDistance(P, permutedQ, { distanceMetric });

        if (distance < smallestDistance) {
            smallestDistance = distance;
        }
    }


    const bboxDistance = distanceMetric([bbox[0], bbox[1]], [bbox[2], bbox[3]]);

    return decay === 'linear' ? linearDecayFunction(smallestDistance, bboxDistance) : exponentialDecayFunction(smallestDistance, bboxDistance);
}

/**
 * Compute discrete Fréchet distance between two polygon Position sequences
 */
export function frechetDistance(
    polygon1: Polygon,
    polygon2: Polygon,
    options: { distanceMetric: DistanceMetric } = { distanceMetric: haversineDistance }
): number {
    const { distanceMetric } = options;

    const numVerticesPolygon1 = polygon1.coordinates[0].length;
    const numVerticesPolygon2 = polygon2.coordinates[0].length;

    const memoizationTable: number[][] = Array.from({ length: numVerticesPolygon1 }, () => Array(numVerticesPolygon2).fill(-1));

    function calculateFrechetDistance(index1: number, index2: number): number {
        // Base cases
        if (memoizationTable[index1][index2] !== -1) {
            return memoizationTable[index1][index2];
        }

        if (index1 === 0 && index2 === 0) {
            memoizationTable[index1][index2] = distanceMetric(
                polygon1.coordinates[0][0],
                polygon2.coordinates[0][0]
            );
        } else if (index1 > 0 && index2 === 0) {
            memoizationTable[index1][index2] = Math.max(
                calculateFrechetDistance(index1 - 1, 0),
                distanceMetric(polygon1.coordinates[0][index1], polygon2.coordinates[0][0])
            );
        } else if (index1 === 0 && index2 > 0) {
            memoizationTable[index1][index2] = Math.max(
                calculateFrechetDistance(0, index2 - 1),
                distanceMetric(polygon1.coordinates[0][0], polygon2.coordinates[0][index2])
            );
        } else if (index1 > 0 && index2 > 0) {
            memoizationTable[index1][index2] = Math.max(
                Math.min(
                    calculateFrechetDistance(index1 - 1, index2),
                    calculateFrechetDistance(index1 - 1, index2 - 1),
                    calculateFrechetDistance(index1, index2 - 1)
                ),
                distanceMetric(polygon1.coordinates[0][index1], polygon2.coordinates[0][index2])
            );
        } else {
            memoizationTable[index1][index2] = Infinity;
        }
        return memoizationTable[index1][index2];
    }

    const frechetDistanceValue = calculateFrechetDistance(numVerticesPolygon1 - 1, numVerticesPolygon2 - 1);

    return frechetDistanceValue;
}

export function exponentialDecayFunction(distance: number, maxDistance: number): number {
    const alpha = -Math.log(0.005) / maxDistance;

    // Exponential decay function to get similarity score
    return Math.exp(-alpha * distance);
}

export function linearDecayFunction(distance: number, maxDistance: number): number {
    // Ensure distance is capped between 0 and maxDistance
    const cappedDistance = Math.min(distance, maxDistance);

    // Linear decay from 1 to 0 over the range [0, maxDistance]
    return 1 - cappedDistance / maxDistance;
}

export function generatePolygonCoordinatePermutations(polygon: Polygon): Polygon[] {
    // Check if the polygon has coordinates
    if (!polygon.coordinates || polygon.coordinates.length === 0) {
        return [];
    }

    const coordinates = polygon.coordinates[0].slice(0, -1); // Get the first ring of the polygon

    const n = coordinates.length;

    // Array to hold all permutations
    const permutations: Polygon[] = [];

    // Generate all permutations by rotating the coordinates
    for (let i = 0; i < n; i++) {

        const permutedCoordinates = [...coordinates.slice(i), ...coordinates.slice(0, i)];
        permutedCoordinates.push(permutedCoordinates[0])

        if (i !== 0) {
            // Create a new permutation starting from the i-th vertex
            permutations.push({
                type: 'Polygon',
                coordinates: [permutedCoordinates] // Wrap in an array for GeoJSON format
            });
        }

        // Create and add the reverse permutation
        const reversedCoordinates = [...permutedCoordinates].reverse();
        permutations.push({
            type: 'Polygon',
            coordinates: [reversedCoordinates] // Wrap in an array for GeoJSON format
        });

    }

    return permutations;
}