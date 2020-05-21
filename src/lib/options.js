import browser from 'webextension-polyfill';

import { getAvailableVoices } from './api';
import { el } from './util';

/* eslint-disable no-use-before-define */

export const API_KEY_NAME = 'apiKey';
export const VOICE_NAME = 'voice';
export const OPTION_DATA = [
  {
    name: API_KEY_NAME,
    label: 'API key',
    attr: {
      size: 40,
    },
  },
  {
    name: VOICE_NAME,
    label: 'Voice',
    type: 'select',
    async options() {
      const apiKey = await getApiKey();
      const emptyOption = {
        value: '',
        label: '— Select voice —',
      };
      if (!apiKey) {
        return [];
      }
      const voices = await getAvailableVoices(apiKey);
      return [emptyOption].concat(
        voices
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ name, ssmlGender }) => ({
            value: name,
            label: `${name} (${ssmlGender})`,
          })),
      );
    },
    description() {
      return el(
        'a',
        {
          href: 'https://cloud.google.com/text-to-speech/docs/voices',
          target: '_blank',
        },
        'Supported voices and languages with samples',
      );
    },
  },
];

/**
 * Get all or a single saved options.
 *
 * @param {string} [key] - Get a specific key.
 * @param {string} [defaultValue] - Default value to return if nothing is set
 *   for when a key is specified.
 * @returns {Promise<*>}
 */
export async function getSavedOptions(key = '', defaultValue = '') {
  const opt = await browser.storage.sync.get(
    key || OPTION_DATA.map((o) => o.name),
  );
  return key ? opt[key] || defaultValue : opt;
}

/**
 * Get saved API key.
 *
 * @returns {Promise<string>}
 */
export async function getApiKey() {
  return getSavedOptions(API_KEY_NAME);
}

/**
 * Get saved voice.
 *
 * @returns {Promise<string>}
 */
export async function getVoice() {
  return getSavedOptions(VOICE_NAME);
}
