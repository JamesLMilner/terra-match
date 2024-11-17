import { h } from "preact";
import style from "./style.module.css";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "preact/hooks";
import maplibregl from "maplibre-gl";
import { randomPolygonId, setupDraw } from "./setup-draw";
import { setupMaplibreMap } from "./setup-maplibre";
import { terraMatch } from "../../../../src";
import { Polygon, Feature, GeoJsonProperties, } from "geojson";
import { GeoJSONStoreFeatures } from "terra-draw";
import { FeatureId } from "terra-draw/dist/store/store";
import { polygonADiamond, polygonAHexagon, polygonARhombus, polygonASquare, polygonATriangle } from "../../../../src/fixtures";
import { centroid } from "@turf/turf";

const mapOptions = {
  id: "maplibre-map",
  lng: 0.5,
  lat: 0.5,
  zoom: 7
};

const shuffle: <T>(array: T[]) => T[] = (array) => {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

const polygons: Feature<Polygon, GeoJsonProperties>[] = shuffle([
  polygonADiamond,
  polygonASquare,
  polygonAHexagon,
  polygonARhombus,
  polygonATriangle
])

const Home = () => {
  const ref = useRef(null);
  const [map, setMap] = useState<undefined | maplibregl.Map>();

  useEffect(() => {
    const maplibreMap = setupMaplibreMap(mapOptions);
    maplibreMap.on("load", () => {
      setMap(maplibreMap);
    });
  }, []);

  const draw = useMemo(() => {
    if (map) {
      const terraDraw = setupDraw(map);
      terraDraw.start();
      return terraDraw;
    }
  }, [map]);


  const [highScore, setHighScore] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [order, setOrder] = useState(0);
  const [decay, setDecay] = useState('exponential')
  const [comparison, setComparison] = useState(0)

  const setScore = useCallback((score: number) => {
    if (score > highScore) {
      setToastMessage('New best match score!')
      setHighScore(score)
    } else if (score > 0.95) {
      setToastMessage('It\'s a match!')
    } else if (score > 0.9) {
      setToastMessage('It\'s a close match!')
    } else if (score > 0.8) {
      setToastMessage('It\'s a not a bad match!')
    } else if (score > 0.7) {
      setToastMessage('It\'s an okay match')
    } else if (score > 0.6) {
      setToastMessage('It\'s a weak match')
    } else if (score > 0.5) {
      setToastMessage('It\'s a bad match')
    } else if (score < 0.4) {
      setToastMessage('It\'s a not a match')
    }

    setComparison(score)
  }, [highScore])

  const matchCallback = useCallback(() => {
    if (!draw || !map || !setScore) {
      return;
    }

    const snapshot = draw.getSnapshot();

    const outlinePolygon = snapshot[0] as Feature<Polygon>
    const firstPolygon = snapshot[1] as Feature<Polygon>

    const score = terraMatch(outlinePolygon.geometry, firstPolygon.geometry, { decay: 'exponential' });

    setScore(score)

    const staticTimeout = setTimeout(() => {
      draw.setMode('static')
    })

    const timeout = setTimeout(() => {
      draw.setMode('polygon')

      draw.removeFeatures([firstPolygon.id as FeatureId, randomPolygonId as FeatureId])

      const nextRandomPolygon = polygons[order] as GeoJSONStoreFeatures
      nextRandomPolygon.id = randomPolygonId
      nextRandomPolygon.properties.mode = 'polygon'
      draw.addFeatures([nextRandomPolygon])
      map?.panTo(centroid(nextRandomPolygon.geometry as Polygon).geometry.coordinates as any, { duration: 0 })
      setComparison(0)
      setToastMessage(null)

      setOrder((order) => order === polygons.length - 1 ? 0 : order + 1)

    }, 3000)

    return () => {
      clearTimeout(staticTimeout)
      clearTimeout(timeout)
    }

  }, [draw, order, setScore, map])

  // Add the initial random polygon
  useEffect(() => {
    if (!draw || !map || draw.hasFeature(randomPolygonId)) {
      return;
    }

    draw.setMode('polygon')
    const randomPolygon = polygons[order] as GeoJSONStoreFeatures
    randomPolygon.id = randomPolygonId
    randomPolygon.properties.mode = 'polygon'
    draw.addFeatures([randomPolygon])
    map?.panTo(centroid(randomPolygon.geometry as Polygon).geometry.coordinates as any, { duration: 0 })
  }, [draw, map, order])

  // Handle the on finish event
  useEffect(() => {
    if (!draw || !map) {
      return;
    }

    draw.on("finish", matchCallback);

    return () => {
      draw.off("finish", matchCallback);
    }

  }, [draw, matchCallback, map]);


  return (
    <div className={style.home} >
      <div ref={ref} className={style.map} id={mapOptions.id}>
        {toastMessage ? <div className={style.toast}><strong>{toastMessage}</strong></div> : null}
        <div className={style.info}>
          <p className={style.firstPara}>
            Terra Match compares two polygons and gives a matching score from 0 - 1 representing the similarity of the polygons.
          </p>
          <p>
            Try tracing the polygon outlined to return a similarity score.
          </p>
          <br />
          <strong>Best match:</strong> {highScore.toFixed(2)}
          <div className={style.decay}>
            <strong>Decay:</strong>
            <select onSelect={(event) => {
              setDecay(event.currentTarget.value)
            }}>
              <option selected={decay === 'linear'}>linear</option>
              <option selected={decay === 'exponential'}>exponential</option>
            </select>
          </div>

        </div>
      </div>
      <div className={style.score}>
        {comparison.toFixed(2)}
      </div>
    </div >
  );
};

export default Home;
