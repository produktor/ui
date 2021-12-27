/**
 * {AbortController} Abort controller to prevent load request
 */
let abortController;

const eventHandlers = [];

/**
 * Default error handler
 *
 * @param errors
 */
let onError;
let onReady;

/**
 * Add event listeners
 *
 * @param eventName
 * @param handler
 */
export function on(eventName, handler) {
  if(eventName === 'error') onError = handler;
  if(eventName === 'ready') onReady = handler;
  return this;
}

/**
 * Stop last request
 */
export function abort() {
  if(abortController) {
    abortController.abort();
  }
}

/**
 * Call API and get JSON using `fetch`
 *  AJAX but with possibility to break previous request
 *
 * @param {string} url
 * @param {Function} callBack
 * @param init Fetch init settings
 */
export function request(url, callBack, init) {
  if(abortController instanceof AbortController) {
    abortController.signal.addEventListener('abort', e => {
      callBack(_getJson(url, init));
    });
    abort();
  } else {
    callBack(_getJson(url, init));
  }
}

/**
 * Fetch and store and stop previous request
 *
 * @param {string} url
 * @param init
 * @return {Promise<*>}
 * @private
 */

function _getJson(url, init) {
  abortController = new AbortController();
  if(!init) {
    init = {
      "cache":  "no-store",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
    };
  }

  init.signal = abortController.signal;

  return fetch(url, init)
    .then(async response => {
      const r = await response.json();

      if(r.errors && onError) {
        onError(r.errors);
      }

      if(onReady) {
        onReady(r);
      }

      return r;
    })
    .catch(err => {
      if(err.name && err.name === "AbortError") {
        return;
      }
    });
}

/**
 * Encode URL component
 *
 * To be more stringent in adhering to RFC 3986 (which reserves !, ', (, ), and *),
 * even though these characters have no formalized URI delimiting uses, the following can be safely used:
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 *
 * @param str
 * @return {string}
 */
export function encode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
