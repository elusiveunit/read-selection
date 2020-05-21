import browser from 'webextension-polyfill';

/**
 * Check if a value is a plain object (an object literal or created with
 * Object.create(null)).
 *
 * @param {*} val
 * @returns {boolean}
 */
function isPlainObject(val) {
  return Boolean(
    val &&
      typeof val === 'object' &&
      Object.prototype.toString.call(val) === '[object Object]' &&
      [Object.prototype, null].includes(Object.getPrototypeOf(val)),
  );
}

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
 * @param {...string|object} classes - Classes as is or objects where they key
 *   is the class name to and the value's truthyness decides if it's included.
 * @returns {string|null}
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
  let props = Array.from(attrChildren).filter((c) => !!c);
  if (props.length === 0) {
    return elem;
  }
  if (isPlainObject(props[0])) {
    Object.entries(props[0]).forEach(([attrName, attrVal]) => {
      if (attrVal != null) {
        elem.setAttribute(attrName, attrVal);
      }
    });
    if (props.length === 1) {
      return elem;
    }
    props = props.slice(1);
  }
  props.forEach((child) => {
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
 * @return {Promise<*>} Execution result.
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
 * @return {Promise<*>} Function result.
 */
export async function runFunctionInActiveTab(fn) {
  const fnText = String(fn);
  if (fnText.indexOf('function') !== 0) {
    throw new Error('Only handles `function` definitions');
  }
  const match = fnText.match(/function ([^(]+)/);
  if (!match || !match[1]) {
    throw new Error('No function name found');
  }
  const fnName = match[1];
  // The function definition followed by execution by name.
  return runCodeInActiveTab(`${fnText};${fnName}();`);
}

/**
 * Show an alert to the user.
 *
 * @param {string} msg - Message to display in the alert.
 * @param {...*} [loggedErrors] - Extra data to log to the console.
 */
export async function userAlert(msg, ...loggedErrors) {
  runCodeInActiveTab(`alert('${msg.replace(/([^\\])'/g, "$1\\'")}');`);
  if (loggedErrors.length) {
    console.error(...loggedErrors);
  }
}
