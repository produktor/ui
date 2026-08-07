export class OsrmApiClient {
  /**
   * @param {Object} [config]
   * @param {string} [config.baseUrl]
   * @param {string} [config.profile]
   */
  constructor(config = {}) {
    this.baseUrl = (config.baseUrl || 'https://osrm.produktor.mywire.org').replace(/\/$/, '');
    this.profile = config.profile || 'driving';
  }

  /**
   * Request a driving route between two lon/lat positions.
   *
   * @param {[number, number]} fromLonLat
   * @param {[number, number]} toLonLat
   * @param {Object} [options]
   * @return {Promise<Object>}
   */
  async route(fromLonLat, toLonLat, options = {}) {
    const url = this.buildRouteUrl(fromLonLat, toLonLat, options);
    const response = await fetch(url.toString(), { cache: 'no-store' });
    if(!response.ok) {
      throw new Error(`OSRM request failed with ${response.status}`);
    }
    return response.json();
  }

  /**
   * @param {[number, number]} fromLonLat
   * @param {[number, number]} toLonLat
   * @param {Object} [options]
   * @return {URL}
   */
  buildRouteUrl(fromLonLat, toLonLat, options = {}) {
    const coords = `${fromLonLat[0]},${fromLonLat[1]};${toLonLat[0]},${toLonLat[1]}`;
    const url = new URL(`${this.baseUrl}/route/v1/${this.profile}/${coords}`);
    url.searchParams.set('overview', options.overview || 'full');
    url.searchParams.set('geometries', options.geometries || 'geojson');
    if(options.steps != null) url.searchParams.set('steps', String(options.steps));
    return url;
  }
}
