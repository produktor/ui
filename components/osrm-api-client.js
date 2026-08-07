export class OsrmApiClient {
  /**
   * @param {Object} [config]
   * @param {string} [config.baseUrl]
   * @param {string} [config.profile]
   */
  constructor(config = {}) {
    this.baseUrl = (config.baseUrl || 'https://osrm.produktor.io').replace(/\/$/, '');
    this.profile = config.profile || 'driving';
  }

  /**
   * Request a route between two lon/lat positions.
   *
   * @param {[number, number]} fromLonLat
   * @param {[number, number]} toLonLat
   * @param {Object} [options]
   * @return {Promise<Object>}
   */
  async route(fromLonLat, toLonLat, options = {}) {
    const url = this.buildRouteUrl(fromLonLat, toLonLat, options);
    let response;
    try {
      response = await fetch(url.toString(), { cache: 'no-store' });
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      throw new Error(`OSRM network error: ${msg}`);
    }
    let data = null;
    try {
      data = await response.json();
    } catch (_) {
      data = null;
    }
    if(!response.ok) {
      const detail = data && (data.message || data.code) ? ` (${data.message || data.code})` : '';
      throw new Error(`OSRM HTTP ${response.status}${detail}`);
    }
    return data;
  }

  /**
   * @param {[number, number]} fromLonLat
   * @param {[number, number]} toLonLat
   * @param {Object} [options]
   * @param {string} [options.profile]
   * @return {URL}
   */
  buildRouteUrl(fromLonLat, toLonLat, options = {}) {
    const profile = options.profile || this.profile || 'driving';
    const coords = `${fromLonLat[0]},${fromLonLat[1]};${toLonLat[0]},${toLonLat[1]}`;
    const url = new URL(`${this.baseUrl}/route/v1/${profile}/${coords}`);
    url.searchParams.set('overview', options.overview || 'full');
    url.searchParams.set('geometries', options.geometries || 'geojson');
    if(options.steps != null) url.searchParams.set('steps', String(options.steps));
    return url;
  }
}
