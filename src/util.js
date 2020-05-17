import browser from 'webextension-polyfill';
import isPlainObject from 'lodash/isPlainObject';

/**
 * Get the currently selected text.
 *
 * @returns {string}
 */
export function getSelectedText() {
  return String(window.getSelection());
}

/**
 * Get class names.
 *
 * @returns {string}
 */
export function classNames(...classes) {
  let className = '';
  Array.from(classes)
    .filter((c) => !!c)
    .forEach((part) => {
      if (typeof part === 'string') {
        className += ` ${part}`;
      } else {
        Object.entries(part).forEach(([cls, isIncluded]) => {
          if (isIncluded) {
            className += ` ${cls}`;
          }
        });
      }
    });
  return className.trim() || null;
}

/**
 * Create an HTML element.
 *
 * @param {string} tagName
 * @param {...object|string|HTMLElement} attrChildren - Optionally include an
 *   object of attributes first. Rest is child nodes. Strings are converted to
 *   text nodes.
 * @returns {HTMLElement}
 */
export function el(tagName, ...attrChildren) {
  const elem = document.createElement(tagName);
  const props = Array.from(attrChildren).filter((c) => !!c);
  if (props.length === 0) {
    return elem;
  }
  let sliceProps = 0;
  if (isPlainObject(props[0])) {
    sliceProps = 1;
    Object.entries(props[0]).forEach(([attrName, attrVal]) => {
      if (attrVal != null) {
        elem.setAttribute(attrName, attrVal);
      }
    });
    if (props.length === 1) {
      return elem;
    }
  }
  props.slice(sliceProps).forEach((child) => {
    const childEl =
      typeof child === 'string' ? document.createTextNode(child) : child;
    elem.appendChild(childEl);
  });
  return elem;
}

/**
 * Run a code snippet in the currently active tab.
 *
 * @param {string} code - Code to run.
 * @return {*} Execution result.
 */
export async function runCodeInActiveTab(code) {
  const result = await browser.tabs.executeScript({
    code,
  });
  return result[0];
}

/**
 * Run a function in the currently active tab.
 *
 * @param {Function} fn - Function to run.
 * @return {*} Function result.
 */
export async function runFunctionInActiveTab(fn) {
  const fnText = String(fn);
  if (fnText.indexOf('function') !== 0) {
    throw new Error('Only handles `function` definitions');
  }
  const fnName = fnText.match(/function ([^(]+)/)[1];
  // The function definition followed by execution by name.
  return runCodeInActiveTab(`${fnText};${fnName}();`);
}

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
async function _fetch(url, method, extraHeaders = {}, body) {
  const params = {
    method,
    body,
    credentials: 'same-origin',
    headers: {
      ...extraHeaders,
    },
  };

  const response = await fetch(url, params);
  const responseContentType = response.headers.get('Content-Type');

  if (!response.ok) {
    console.error('Fetch response', response);
    throw new Error(`Got response ${response.status} ${response.statusText}`);
  }

  return responseContentType.includes(JSON_MIME_TYPE)
    ? response.json()
    : response.text();
}

/**
 * Wrapped fetch for JSON calls.
 *
 * @ignore
 * @see _fetch
 */
async function _fetchJson(url, method, extraHeaders = {}, body) {
  return _fetch(
    url,
    method,
    {
      'Accept': JSON_MIME_TYPE,
      'Content-Type': JSON_MIME_TYPE,
      ...extraHeaders,
    },
    typeof body === 'string' ? body : JSON.stringify(body),
  );
}

/**
 * Run a GET request.
 *
 * @param {string} url - URL to get.
 * @param {object} [extraHeaders] - Any extra headers to send.
 * @returns {Promise} Resolved with the response data.
 */
export function httpGet(url, extraHeaders = {}) {
  return _fetch(url, 'GET', extraHeaders);
}

/**
 * Run a POST request.
 *
 * @param {string} url - URL to get.
 * @param {object} [extraHeaders] - Any extra headers to send.
 * @param {string|Blob|FormData} [body] - POST body.
 * @returns {Promise} Resolved with the response data.
 */
export function httpPost(url, extraHeaders = {}, body) {
  return _fetch(url, 'POST', extraHeaders, body);
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
export function httpGetJSON(url, extraHeaders = {}) {
  return _fetchJson(url, 'GET', extraHeaders);
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
export function httpPostJSON(url, extraHeaders = {}, body) {
  return _fetchJson(url, 'POST', extraHeaders, body);
}
