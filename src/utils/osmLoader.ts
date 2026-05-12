import osmtogeojson from 'osmtogeojson'
import type { FeatureCollection } from 'geojson'

const BBOX = '35.140,126.900,35.155,126.930'
const QUERY = `
[out:json][timeout:25];
(
  way["building"](${BBOX});
  way["highway"](${BBOX});
);
out body;
>;
out skel qt;
`

export async function loadGwangjuOSM(): Promise<FeatureCollection> {
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(QUERY)}`
  const res = await fetch(url)
  const osmData = await res.json()
  return osmtogeojson(osmData)
}
