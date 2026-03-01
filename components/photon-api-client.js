export class PhotonApiClient {
  /**
   * @param {Object} [config]
   * @param {string} [config.baseUrl]
   */
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://photon.produktor.mywire.org/api';
  }

  /**
   * Search places via Photon API.
   *
   * Supported options:
   * - lon, lat, zoom, locationBiasScale
   * - limit, lang, bbox
   * - osmTag (string|string[])
   * - layer (string|string[])
   *
   * @param {string} query
   * @param {Object} [options]
   * @return {Promise<Object>}
   */
  async search(query, options = {}) {
    const url = this.buildSearchUrl(query, options);
    const response = await fetch(url.toString(), { cache: 'no-store' });
    if(!response.ok) {
      throw new Error(`Photon request failed with ${response.status}`);
    }
    return response.json();
  }

  buildSearchUrl(query, options) {
    const url = new URL(this.baseUrl);
    const params = url.searchParams;

    params.set('q', query || '');

    if(options.lon != null) params.set('lon', String(options.lon));
    if(options.lat != null) params.set('lat', String(options.lat));
    if(options.zoom != null) params.set('zoom', String(options.zoom));
    if(options.locationBiasScale != null) {
      params.set('location_bias_scale', String(options.locationBiasScale));
    }
    if(options.limit != null) params.set('limit', String(options.limit));
    if(options.lang) params.set('lang', String(options.lang));
    if(options.bbox) {
      params.set('bbox', Array.isArray(options.bbox) ? options.bbox.join(',') : String(options.bbox));
    }

    this.appendMultiParam(params, 'osm_tag', options.osmTag);
    this.appendMultiParam(params, 'layer', options.layer);

    return url;
  }

  appendMultiParam(params, key, value) {
    if(value == null) return;
    const values = Array.isArray(value) ? value : [value];
    values.forEach(v => {
      if(v != null && v !== '') params.append(key, String(v));
    });
  }
}
