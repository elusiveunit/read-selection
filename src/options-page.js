import browser from 'webextension-polyfill';

import { OPTION_DATA, getSavedOptions } from './lib/options';
import { classNames, el } from './lib/util';

import './options-page.scss';

const OPTIONS_FORM = document.querySelector('form');
const LOADER_CLASS_NAME = 'loader';

/**
 * Render options.
 */
async function renderOptions() {
  /* eslint-disable no-await-in-loop */

  // Some fields can be async
  const loader = <div class={LOADER_CLASS_NAME}>Loading options...</div>;
  OPTIONS_FORM.prepend(loader);

  const values = await getSavedOptions();
  const fields = [];
  // TODO: Handle better
  let has400Error = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const fieldData of OPTION_DATA) {
    const defaults = {
      attr: {},
      type: 'input',
    };
    const { attr, defaultValue, description, label, name, options, type } = {
      ...defaults,
      ...fieldData,
    };

    // Select options
    let selectOptions = [];
    if (options) {
      try {
        const optionsData = await options();
        selectOptions = optionsData.map((opt) => (
          <option value={opt.value} selected={opt.value === values[name]}>
            {opt.label}
          </option>
        ));
      } catch (err) {
        console.error(err);
        if (String(err).includes('400 Bad Request')) {
          has400Error = true;
        }
      }
      // Don't render an empty select
      if (!selectOptions.length) {
        continue;
      }
    }

    const ControlElement = type || 'input';
    fields.push(
      <div class="field">
        <label>
          <span>{label}</span>
          <ControlElement
            {...attr}
            type={ControlElement === 'input' ? attr.type || 'text' : null}
            name={name}
            class={classNames(name, attr.class)}
            value={values[name] || defaultValue || ''}
          >
            {selectOptions}
          </ControlElement>
        </label>
        {Boolean(description) && <div>{description()}</div>}
      </div>,
    );
  }
  fields.push(<button type="submit">Save</button>);

  OPTIONS_FORM.textContent = '';

  if (has400Error) {
    OPTIONS_FORM.appendChild(
      <p class="error">The supplied API key doesn't work.</p>,
    );
  }

  fields.forEach((field) => {
    OPTIONS_FORM.appendChild(field);
  });
}

/**
 * Save and reload options.
 *
 * @param {Event} e - Submit event.
 */
async function handleSubmit(e) {
  e.preventDefault();

  const data = {};
  Array.from(OPTIONS_FORM.elements)
    .filter((field) => typeof field.value !== 'undefined')
    .forEach((field) => {
      data[field.name] = field.value;
    });
  console.log(data);
  await browser.storage.sync.set(data);

  renderOptions();
}

/**
 * Render options.
 */
async function init() {
  renderOptions();

  OPTIONS_FORM.addEventListener('submit', handleSubmit);
}

document.addEventListener('DOMContentLoaded', init);
