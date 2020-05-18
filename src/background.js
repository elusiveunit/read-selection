import browser from 'webextension-polyfill';

import { getApiKey, getVoice } from './lib/options';
import { httpPostJSON, userAlert } from './lib/util';

async function onReadSelection({ selectionText }) {
  // Strip line breaks and trailing periods.
  const text = selectionText.replace(/[\r\n]+/g, ' ').replace(/[。.]$/, '');
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('You must set an API key in the addon options.');
    }

    const voice = await getVoice();
    if (!voice) {
      throw new Error('You must select a voice in the addon options.');
    }

    const voiceParts = voice.split('-');
    const tts = await httpPostJSON(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {},
      {
        input: {
          text,
        },
        voice: {
          name: voice,
          languageCode: `${voiceParts[0]}-${voiceParts[1]}`,
        },
        audioConfig: {
          audioEncoding: 'OGG_OPUS',
        },
      },
    );
    const audio = new Audio(
      `data:audio/ogg;codecs=opus;base64,${tts.audioContent}`,
    );
    audio.play();
  } catch (err) {
    const msg =
      err.message.includes('400 Bad Request') ||
      err.message.includes('403 Forbidden')
        ? "Request failed, it seems the API key isn't accepted."
        : err.message;
    userAlert(`TTS failed: ${msg}`, err);
  }
}

const MENU_ITEMS = [
  {
    id: 'read-selection',
    title: 'Read selection',
    contexts: ['selection'],
    handler: onReadSelection,
  },
];

MENU_ITEMS.forEach(({ id, title, contexts }) => {
  browser.contextMenus.create({
    id,
    title,
    contexts,
  });
});
browser.contextMenus.onClicked.addListener((info, tab) => {
  MENU_ITEMS.forEach(({ id, handler }) => {
    if (info.menuItemId === id) {
      handler(info, tab);
    }
  });
});
