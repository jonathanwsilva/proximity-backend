import { transpose } from '../web_modules/ramda.js'
import mapboxgl from '../web_modules/mapbox-gl/dist/mapbox-gl.js';

const padding = 100

export default (container, jobs, token) => {
    const [x, y] = transpose(jobs.map(job => job.coordinates));

    const map = new mapboxgl.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v9',
        bounds: [
            [Math.min(...x), Math.min(...y)],
            [Math.max(...x), Math.max(...y)]
        ],
        fitBoundsOptions: {
            padding
        },
        accessToken: token
    });

    jobs.forEach(job => {
        new mapboxgl.Marker().setLngLat(job.coordinates).addTo(map);
    });
}
