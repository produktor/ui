/**
 * Geo compute utils library
 *
 * @type {{getBoundsByCoordinates: (function(*): {'maplibregl.LngLatBounds'}), createWktPolygonFromBounds: (function(*): string), getFeatureCenter: (function(*): {lon: *, lat: *})}}
 */
export const utils = {

  /**
   * Get bound by GeoJSON coordinates
   *
   * @return {{maplibregl.LngLatBounds}}
   * @param featureGeometry GeoJSON coordinates
   */
  getBoundsByCoordinates: (featureGeometry) => {
    const coordinates = featureGeometry.coordinates;
    const LngLat = maplibregl.LngLat;
    const LngLatBounds = maplibregl.LngLatBounds;
    const type = featureGeometry.type;
    let fit;
    let southWest;
    let northEast;

    switch (type) {
      case  'Point':
        southWest = new LngLat(coordinates[0], coordinates[1]);
        northEast = southWest;
        break;
      case  'Polygon':
      case  'MultiPolygon':
        fit = new L[type](coordinates).getBounds();
        southWest = new LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
        northEast = new LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
        break;
      case  'LineString':
        fit = coordinates.reduce((bounds, coord) => bounds.extend(coord), new LngLatBounds(coordinates[0], coordinates[0]));
        southWest = new LngLat(fit['_sw']['lng'], fit['_sw']['lat']);
        northEast = new LngLat(fit['_ne']['lng'], fit['_ne']['lat']);
    }

    return new LngLatBounds(southWest, northEast);
  },

  /**
   * Create WKT polygon from bounds
   *
   * @param bounds
   * @return {string}
   */
  createWktPolygonFromBounds: (bounds) => {
    let bottomLeft = bounds.getSouthWest();
    let bottomRight = bounds.getSouthEast();
    let topRight = bounds.getNorthEast();
    let topLeft = bounds.getNorthWest();
    let quad = [topLeft.lng + ' ' + topLeft.lat,
      topRight.lng + ' ' + topRight.lat,
      bottomRight.lng + ' ' + bottomRight.lat,
      bottomLeft.lng + ' ' + bottomLeft.lat];
    quad.push(quad[0]);
    return "POLYGON((" + quad.join(',') + "))";
  },

  /**
   * Get feature center point
   *
   * @param feature
   * @return {Object}
   */
  getFeatureCenter: (feature) => {
    const bounds = utils.getBoundsByCoordinates(feature.geometry);
    return {
      lon: feature.longitude ? feature.longitude : bounds._sw.lng + (bounds._ne.lng - bounds._sw.lng) / 2,
      lat: feature.latitude ? feature.latitude : bounds._ne.lat + (bounds._sw.lat - bounds._ne.lat) / 2
    };
  },

  /**
   * Generate and set feature title and description text.
   *
   * @param feature
   */
  describeFeature: (feature) => {
    let properties = feature.properties;
    let isAddress = properties.street && properties.street !== '';
    let description = "";
    let title = "";
    let titleChunks = [];
    let postCodesFormatted;
    const pushTitleChunk = (value) => {
      if(value == null) return;
      const chunk = String(value).trim();
      if(!chunk) return;
      if(!titleChunks.some(existing => String(existing).toLowerCase() === chunk.toLowerCase())) {
        titleChunks.push(chunk);
      }
    };

    /**
     *
     "country": "DE",
     "street": "Spaldingstraße",
     "geohash": "u1x0euhnsjjb6es0cw4bugcp",
     "postcode": "20097",
     "housenumber": "64",
     "locationid": 9565487,
     "type": "Address",
     "admintypename": "Stadtteil",
     "locationtypeid": 10,
     "suburb": "Hammerbrook",
     "county": "Hamburg",
     "state": "Hamburg"
     */

    // Keep the original place name visible in autocomplete/search labels.
    if(properties.name) {
      pushTitleChunk(properties.name);
    }

    if(properties.street) {
      if(properties.housenumber) {
        pushTitleChunk(properties.street + ' ' + properties.housenumber);
      } else {
        pushTitleChunk(properties.street);
      }
    }

    if(properties.suburb) {
      pushTitleChunk(properties.suburb);
    }

    if(properties.citydistrict) {
      pushTitleChunk(properties.citydistrict);
    }

    if(properties.postcode) {
      let postCodes = properties.postcode.split(/,\s*/);
      if(postCodes.length > 1) {
        postCodesFormatted = postCodes[0] + " - " + postCodes[postCodes.length - 1];
      } else {
        postCodesFormatted = postCodes.join(", ");
      }
    }

    if(properties.city) {
      if(postCodesFormatted) {
        pushTitleChunk(postCodesFormatted + " " + properties.city);
        postCodesFormatted = null;
      } else {
        pushTitleChunk(properties.city);
      }
    }

    // if(properties.suburb) {
    //   if(postCodesFormatted) {
    //     titleChunks.push(postCodesFormatted + " " + properties.suburb);
    //     postCodesFormatted = null;
    //   } else {
    //     titleChunks.push(properties.suburb);
    //   }
    // }

    if(properties.county) {
      if(postCodesFormatted) {
        pushTitleChunk(postCodesFormatted + " " + properties.county);
        postCodesFormatted = null;
      } else {
        pushTitleChunk(properties.county);
      }
    }


    if(properties.statedistrict) {
      if(postCodesFormatted) {
        pushTitleChunk(postCodesFormatted + " " + properties.statedistrict);
        postCodesFormatted = null;
      } else {
        pushTitleChunk(properties.statedistrict);
      }
    }

    if(postCodesFormatted) {
      pushTitleChunk(postCodesFormatted);
    }

    if(properties.state) {
      pushTitleChunk(properties.state);
    }


    title = titleChunks.join(', ');

    if(properties.level && properties.level.match(/[A-Z]/)) {
      description += properties.level;
    }

    if(description !== "" && (properties.postcode || properties.parentname)) {
      description += ", ";
    }


    // if(properties.parentname) {
    //   description += " " + properties.parentname;
    // }

    // if(description !== ""  && properties.admintypename) {
    //   description += ", ";
    // }

    if(properties.administration) {
      description += properties.administration;
    }

    // if(properties.state) {
    //   description += " " + properties.state;
    // }

    feature.id = utils.genUUID();
    feature.title = title;
    feature.description = description;
  },

  /**
   * Generate UUID
   *
   * @return {string}
   */
  genUUID: () => {
    let u = Date.now().toString(16) + Math.random().toString(16) + '0'.repeat(16);
    return [
      u.substr(0, 8),
      u.substr(8, 4),
      '4000-8' + u.substr(13, 3),
      u.substr(16, 12)].join('-');
  }
};
