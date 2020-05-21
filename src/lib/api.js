const JSON_MIME_TYPE = 'application/json';

/**
 * Wrapped fetch, used for helpers.
 *
 * @ignore
 * @param {string} url - URL to fetch.
 * @param {string} method - HTTP method (GET, POST...).
 * @param {object} [extraHeaders] - Any extra headers to add.
 * @param {string|Blob|FormData} [body] - Body, e.g. for POST requests.
 * @returns {Promise} Resolved with the response data.
 */
async function _fetch(url, params = {}) {
  const response = await fetch(url, params);
  const responseContentType = response.headers.get('Content-Type');

  if (!response.ok) {
    console.error('Fetch response', response);
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return String(responseContentType).includes(JSON_MIME_TYPE)
    ? response.json()
    : response.text();
}

/**
 * Wrapped fetch for JSON calls.
 *
 * @ignore
 * @see _fetch
 */
function _fetchJson(url, params = {}) {
  const jsonParams = {
    ...params,
    headers: {
      'Accept': JSON_MIME_TYPE,
      'Content-Type': JSON_MIME_TYPE,
      ...params.headers,
    },
  };
  if (params.body) {
    jsonParams.body =
      typeof params.body === 'string'
        ? params.body
        : JSON.stringify(params.body);
  }
  return _fetch(url, jsonParams);
}

/**
 * Run a GET request.
 *
 * @param {string} url - URL to get.
 * @param {object} [extraHeaders] - Any extra headers to send.
 * @returns {Promise} Resolved with the response data.
 */
export function httpGet(url, params = {}) {
  return _fetch(url, { ...params, method: 'GET' });
}

/**
 * Run a POST request.
 *
 * @param {string} url - URL to get.
 * @param {object} [extraHeaders] - Any extra headers to send.
 * @param {string|Blob|FormData} [body] - POST body.
 * @returns {Promise} Resolved with the response data.
 */
export function httpPost(url, params = {}) {
  return _fetch(url, { ...params, method: 'POST' });
}

/**
 * Run a GET request to fetch JSON.
 *
 * Just like a regular fetch but with `application/json` headers set.
 *
 * @param {string} url - URL to get.
 * @param {object} [extraHeaders] - Any extra headers to send.
 * @returns {Promise} Resolved with the JSON response.
 */
export function httpGetJSON(url, params = {}) {
  return _fetchJson(url, { ...params, method: 'GET' });
}

/**
 * Run a JSON POST request.
 *
 * Just like a regular fetch but with `application/json` headers set.
 *
 * @param {string} url - URL to get.
 * @param {object} [extraHeaders] - Any extra headers to send.
 * @param {string|Blob|FormData} [body] - POST body.
 * @returns {Promise} Resolved with the JSON response.
 */
export function httpPostJSON(url, params) {
  return _fetchJson(url, { ...params, method: 'POST' });
}

/**
 * Get available voices.
 *
 * @param {string} apiKey - Google Cloud API key.
 * @returns {Promise} Resolved with an array of voices.
 */
export async function getAvailableVoices(apiKey) {
  const repsonse = await httpGetJSON(
    `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`,
  );
  return repsonse.voices;
}

/**
 * Get synthesized audio data based on text and voice input.
 *
 * @param {string} apiKey - Google Cloud API key.
 * @param {string} text - The text to synthesized.
 * @param {string} voiceName - Name/ID of the voice to use.
 * @returns {Promise} Resolved with bases64 encoded ogg opus data.
 */
export async function synthesizeText(apiKey, text, voiceName) {
  const voiceParts = voiceName.split('-');
  const repsonse = await httpPostJSON(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      body: JSON.stringify({
        input: {
          text,
        },
        voice: {
          name: voiceName,
          languageCode: `${voiceParts[0]}-${voiceParts[1]}`,
        },
        audioConfig: {
          audioEncoding: 'OGG_OPUS',
        },
      }),
    },
  );
  return repsonse.audioContent;
}
