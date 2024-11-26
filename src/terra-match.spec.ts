import * as turf from '@turf/turf';
import { exponentialDecayFunction, generateGeometryCoordinatePermutations, terraMatch } from './terra'; // Adjust the import path as necessary
import { testLineStrings, polygons, lineStrings, testPolygons } from './fixtures';


describe('decayFunction', () => {
    it("0% of distance should be 1", () => {
        expect(exponentialDecayFunction(0, 1000)).toBe(1)
    })

    it("100% of distance should be close to 0.01", () => {
        expect(exponentialDecayFunction(1000, 1000)).toBeCloseTo(0.01, 2)
    })

    it("0.1% of max distance should be near 0.99", () => {
        expect(exponentialDecayFunction(1, 1000)).toBeCloseTo(0.99)
    })

    it("1% of max distance should be near 0.99", () => {
        expect(exponentialDecayFunction(10, 1000)).toBeCloseTo(0.95)
    })

    it("25% of max distance should be near 0.1", () => {
        expect(exponentialDecayFunction(250, 2000)).toBeCloseTo(0.5, 1)
    })

    it("50% of max distance should be near 0.1", () => {
        expect(exponentialDecayFunction(1000, 2000)).toBeCloseTo(0.10, 1)
    })

    it("95% of max distance should be near 0.01", () => {
        expect(exponentialDecayFunction(950, 1000)).toBeCloseTo(0.01, 2)
    })

    it("70% of max distance should be near 0.25", () => {
        expect(exponentialDecayFunction(700, 1000)).toBeCloseTo(0.025, 2)
    })

    it("1000% of max distance should be near 0.001", () => {
        expect(exponentialDecayFunction(10000, 1000)).toBeCloseTo(0.001)
    })
})

describe('generatePolygonCoordinatePermutations', () => {
    it.each(polygons)('can generate coordinate permutations for a %s polygon', (polygon) => {
        const result = generateGeometryCoordinatePermutations(testPolygons[polygon].geometry)
        const testPolygonInnerCoords = testPolygons[polygon].geometry.coordinates[0]

        const seen = new Set<string>()
        result.forEach((p) => {
            expect(p.type).toBe("Polygon")
            expect(p.coordinates[0].length).toEqual(testPolygonInnerCoords.length)
            expect(testPolygonInnerCoords[testPolygonInnerCoords.length - 1]).toEqual(testPolygonInnerCoords[0])
            const key = JSON.stringify(p.coordinates[0])
            expect(seen.has(key)).toBe(false)
            seen.add(key)
        })

        // Example: 
        // [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 0, 1 ], [ 0, 0 ]

        // Forward:

        // [ 1, 0 ], [ 1, 1 ], [ 0, 1 ], [ 0, 0 ], [ 1, 0 ]

        // [ 1, 1 ], [ 0, 1 ], [ 0, 0 ], [ 1, 0 ], [ 1, 1 ]

        // [ 0, 1 ], [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 0, 1 ]

        // Backward

        // [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, 0 ]

        // [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, 0 ], [ 0, 1 ]

        // [ 1, 1 ], [ 1, 0 ], [ 0, 0 ], [ 0, 1 ], [ 1, 1 ]

        // [ 1, 0 ], [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ]

        const nonStartingCoordinates = testPolygons[polygon].geometry.coordinates[0].length - 2
        expect(result.length).toBe((nonStartingCoordinates) * 2 + 1)
    })

    it.each(lineStrings)('can generate coordinate permutations for a %s linestring', (linestring) => {
        const testLineString = testLineStrings[linestring]
        const result = generateGeometryCoordinatePermutations(testLineString.geometry)

        const seen = new Set<string>()
        result.forEach((permutedLinestring) => {
            expect(permutedLinestring.type).toBe("LineString")
            expect(permutedLinestring.coordinates.length).toEqual(testLineString.geometry.coordinates.length)
            const key = JSON.stringify(permutedLinestring.coordinates)
            expect(seen.has(key)).toBe(false)
            seen.add(key)
        })

        // Example: 
        // [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 0, 1 ],  

        // Forward:

        // [ 1, 0 ], [ 1, 1 ], [ 0, 1 ], [ 0, 0 ]

        // [ 1, 1 ], [ 0, 1 ], [ 0, 0 ], [ 1, 0 ]

        // [ 0, 1 ], [ 0, 0 ], [ 1, 0 ], [ 1, 1 ]

        // Backward

        // [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ]

        // [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, 0 ]

        // [ 1, 1 ], [ 1, 0 ], [ 0, 0 ], [ 0, 1 ]

        // [ 1, 0 ], [ 0, 0 ], [ 0, 1 ], [ 1, 1 ]

        expect(result.length).toBe(testLineString.geometry.coordinates.length * 2)
    })
})

describe("terraMatch", () => {
    describe.each(polygons)('polygon %s calculated against', (polygon) => {
        const polygonGeometry = testPolygons[polygon].geometry

        const n = 10;
        const start = 99.9;
        const end = 1.1

        // We want to create a series of values for scaling the polygon up and down by reasonable values
        const growValues = Array.from({ length: n }, (_, i) => +(start * Math.pow(end / start, i / (n - 1))).toFixed(3)).sort((a, b) => b - a)
        const shrinkValues = growValues.map(v => +(v / 100).toFixed(3))

        describe("up scaled polygons", () => {
            let i = 0;
            it.each(growValues)("gives appropriate value for %f times scale", (scale) => {
                const dist = terraMatch(polygonGeometry, turf.transformScale(polygonGeometry, scale));
                expect(dist).toBeGreaterThan(0)
                expect(dist).toBeLessThan(1)
                if (i > 0) {
                    const lastDist = terraMatch(polygonGeometry, turf.transformScale(polygonGeometry, growValues[i - 1]));
                    expect(dist).toBeGreaterThan(lastDist)
                }
                i++
            })
        })

        describe('down scaled polygons', () => {
            let j = 0;
            it.each(shrinkValues)("gives appropriate value for %f times scale", (scale) => {
                const dist = terraMatch(polygonGeometry, turf.transformScale(polygonGeometry, scale));
                expect(dist).toBeGreaterThan(0)
                expect(dist).toBeLessThan(1)

                if (j > 0) {
                    const lastDist = terraMatch(polygonGeometry, turf.transformScale(polygonGeometry, shrinkValues[j - 1]));
                    expect(dist).toBeLessThan(lastDist)
                }
                j++
            })
        })

        describe('rotated polygons', () => {
            it.each([45, 90, 135, 180, 225])("gives appropriate value for %f angle rotation", (angle) => {
                const dist = terraMatch(polygonGeometry, turf.transformRotate(polygonGeometry, angle, { pivot: turf.centroid(polygonGeometry) }));
                expect(dist).toBeGreaterThan(0)
                expect(dist).toBeLessThan(1)
            })
        })

    })

    describe('accounts for arbitrary coordinate ordering', () => {
        it('square rotated clockwise 180 degrees is close to 1', () => {
            const dist = terraMatch(testPolygons.square.geometry, turf.transformRotate(testPolygons.square.geometry, 180));
            expect(dist).toBeCloseTo(1)
        })

        it('square rotated anticlockwise 180 degrees is close to 1', () => {
            const dist = terraMatch(testPolygons.square.geometry, turf.transformRotate(testPolygons.square.geometry, -180));
            expect(dist).toBeCloseTo(1)
        })

        it('hexagon rotated clockwise 180 degrees is close to 1', () => {
            const dist = terraMatch(testPolygons.hexagon.geometry, turf.transformRotate(testPolygons.hexagon.geometry, 180));
            expect(dist).toBeCloseTo(1)
        })

        it('hexagon rotated anticlockwise 180 degrees is close to 1', () => {
            const dist = terraMatch(testPolygons.hexagon.geometry, turf.transformRotate(testPolygons.hexagon.geometry, -180));
            expect(dist).toBeCloseTo(1)
        })
    })

    describe('accounts for additional midpoints which do not change the polygon shape', () => {
        it('square', () => {
            const dist = terraMatch(
                {
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
                },
                {
                    type: "Polygon",
                    coordinates: [
                        [
                            [0, 0],
                            [0.5, 0], // Inserted midpoint
                            [1, 0],
                            [1, 0.5], // Inserted midpoint
                            [1, 1],
                            [0.5, 1], // Inserted midpoint
                            [0, 1],
                            [0, 0.5], // Inserted midpoint
                            [0, 0]
                        ]
                    ]
                }
            );
            expect(dist).toBeCloseTo(1)
        })
    })
});
