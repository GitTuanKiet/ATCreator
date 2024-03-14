import bun from 'bun';
import { config } from './config';

let BASE_URL: string = 'https://api16-normal-v6.tiktokv.com/media/api/text/speech/invoke';
const DEFAULT_VOICE = 'en_us_001';
let tiktokSessionId: String = config.tiktokSessionId;

function prepareText(text: string) {
  text = text.replace('+', 'plus');
  text = text.replace(/\s/g, '+');
  text = text.replace('&', 'and');
  return text;
}

function handleStatusError(status_code: Number) {
  switch (status_code) {
    case 1:
      return `Your TikTok session id might be invalid or expired. Try getting a new one. status_code: ${status_code}`;
    case 2:
      return `The provided text is too long. status_code: ${status_code}`;
    case 4:
      return `Invalid speaker, please check the list of valid speaker values. status_code: ${status_code}`;
    case 5:
      return `No session id found. status_code: ${status_code}`;
  }
}

const initFile = (filePath: string, text: string, text_speaker: string) => {
  if (!text) throw new Error('You must provide a text to convert to audio');
  const req_text = prepareText(text);
  const URL = `${BASE_URL}/?text_speaker=${text_speaker}&req_text=${req_text}&speaker_map_type=0&aid=1233`;
  const headers = {
    'User-Agent': 'com.zhiliaoapp.musically/2022600030 (Linux; U; Android 7.1.2; es_ES; SM-G988N; Build/NRD90M;tt-ok/3.12.13.1)',
    Cookie: `sessionid=${tiktokSessionId}`,
    'Accept-Encoding': 'gzip,deflate,compress',
  };
  return { URL, headers, filePath };
};

class TikTokTTS {
  static async createAudioFile(text: string, fileName: string, text_speaker = DEFAULT_VOICE) {
    const { URL, headers, filePath } = initFile(fileName, text, text_speaker);
    try {
      const response = await fetch(URL, {
        method: 'POST',
        body: null,
        headers: headers
      });

      const result = await response.json();
      const status_code = result?.status_code;
      if (status_code !== 0) {
        throw new Error(handleStatusError(status_code))
      }
      const encoded_voice = result?.data?.v_str;
      const audioBuffer = Buffer.from(encoded_voice, 'base64');
      await bun.write(filePath, audioBuffer);

      console.log('TikTokTTS => Audio file created:', filePath);
      return filePath;
    } catch (err) {
      console.error('Error creating audio file in TikTokTTS', err);
    }
  }

  static async getAudioBuffer(text: string, text_speaker = DEFAULT_VOICE) {
    const { URL, headers } = initFile('', text, text_speaker);
    try {
      const response = await fetch(URL, {
        method: 'POST',
        body: null,
        headers: headers
      });
      const result = await response.json();
      const status_code = result?.data?.status_code;
      if (status_code !== 0) {
        throw new Error(handleStatusError(status_code));
      }
      const encoded_voice = result?.data?.data?.v_str;

      console.log('TikTokTTS => Audio buffer created');
      return Buffer.from(encoded_voice, 'base64');
    } catch (err) {
      console.error('Error getting audio buffer in TikTokTTS', err);
    }
  }
}

export const SUPPORTED_VOICES_TIKTOK = [
  {
    English: {
      'Game On': 'en_male_jomboy',
      'Jessie': 'en_us_002',
      'Warm': 'es_mx_002',
      'Wacky': 'en_male_funny',
      'Scream': 'en_us_ghostface',
      'Empathetic': 'en_female_samc',
      'Serious': 'en_male_cody',
      'Beauty Guru': 'en_female_makeup',
      'Bestie': 'en_female_richgirl',
      'Trickster': 'en_male_grinch',
      'Joey': 'en_us_006',
      'Story Teller': 'en_male_narration',
      'Mr. GoodGuy': 'en_male_deadpool',
      'Narrator': 'en_uk_001',
      'Male English UK': 'en_uk_003',
      'Metro': 'en_au_001',
      'Alfred': 'en_male_jarvis',
      'ashmagic': 'en_male_ashmagic',
      'olantekkers': 'en_male_olantekkers',
      'Lord Cringe': 'en_male_ukneighbor',
      'Mr. Meticulous': 'en_male_ukbutler',
      'Debutante': 'en_female_shenna',
      'Varsity': 'en_female_pansino',
      'Marty': 'en_male_trevor',
      'Pop Lullaby': 'en_female_f08_twinkle',
      'Classic Electric': 'en_male_m03_classical',
      'Bae': 'en_female_betty',
      'Cupid': 'en_male_cupid',
      'Granny': 'en_female_grandma',
      'Cozy': 'en_male_m2_xhxs_m03_christmas',
      'Author': 'en_male_santa_narration',
      'Caroler': 'en_male_sing_deep_jingle',
      'Santa': 'en_male_santa_effect',
      'NYE 2023': 'en_female_ht_f08_newyear',
      'Magician': 'en_male_wizard',
      'Opera': 'en_female_ht_f08_halloween',
      'Euphoric': 'en_female_ht_f08_glorious',
      'Hypetrain': 'en_male_sing_funny_it_goes_up',
      'Melodrama': 'en_female_ht_f08_wonderful_world',
      'Quirky Time': 'en_male_m2_xhxs_m03_silly',
      'Peaceful': 'en_female_emotional',
      'Toon Beat': 'en_male_m03_sunshine_soon',
      'Open Mic': 'en_female_f08_warmy_breeze',
      'Jingle': 'en_male_m03_lobby',
      'Thanksgiving': 'en_male_sing_funny_thanksgiving',
      'Cottagecore': 'en_female_f08_salut_damour',
      'Professor': 'en_us_007',
      'Scientist': 'en_us_009',
      'Confidence': 'en_us_010',
      'Smooth': 'en_au_002',
    },
    Disney: {
      'Ghost Face': 'en_us_ghostface',
      'Chewbacca': 'en_us_chewbacca',
      'C3PO': 'en_us_c3po',
      'Stitch': 'en_us_stitch',
      'Stormtrooper': 'en_us_stormtrooper',
      'Rocket': 'en_us_rocket',
      'Madame Leota': 'en_female_madam_leota',
      'Ghost Host': 'en_male_ghosthost',
      'Pirate': 'en_male_pirate',
    },
    French: {
      'French - Male 1': 'fr_001',
      'French - Male 2': 'fr_002',
    },
    Spanish: {
      'Spanish (Spain) - Male': 'es_002',
      'Spanish MX - Male': 'es_mx_002',
    },
    Portuguese: {
      'Portuguese BR - Female 1': 'br_001',
      'Portuguese BR - Female 2': 'br_003',
      'Portuguese BR - Female 3': 'br_004',
      'Portuguese BR - Male': 'br_005',
      'Ivete Sangalo': 'bp_female_ivete',
      'Ludmilla': 'bp_female_ludmilla',
      'Lhays Macedo': 'pt_female_lhays',
      'Laizza': 'pt_female_laizza',
      'Galvão Bueno': 'pt_male_bueno',
    },
    German: {
      'German - Female': 'de_001',
      'German - Male': 'de_002',
    },
    Indonesian: {
      'Indonesian - Female': 'id_001',
    },
    Japanese: {
      'Japanese - Female 1': 'jp_001',
      'Japanese - Female 2': 'jp_003',
      'Japanese - Female 3': 'jp_005',
      'Japanese - Male': 'jp_006',
      'りーさ': 'jp_female_fujicochan',
      '世羅鈴': 'jp_female_hasegawariona',
      'Morio’s Kitchen': 'jp_male_keiichinakano',
      '夏絵ココ': 'jp_female_oomaeaika',
      '低音ボイス': 'jp_male_yujinchigusa',
      '四郎': 'jp_female_shirou',
      '玉川寿紀': 'jp_male_tamawakazuki',
      '庄司果織': 'jp_female_kaorishoji',
      '八木沙季': 'jp_female_yagishaki',
      'ヒカキン': 'jp_male_hikakin',
      '丸山礼': 'jp_female_rei',
      '修一朗': 'jp_male_shuichiro',
      'マツダ家の日常': 'jp_male_matsudake',
      'まちこりーた': 'jp_female_machikoriiita',
      'モジャオ': 'jp_male_matsuo',
      'モリスケ': 'jp_male_osada',
    },
    Korean: {
      'Korean - Male 1': 'kr_002',
      'Korean - Female': 'kr_003',
      'Korean - Male 2': 'kr_004',
    },
    Vietnamese: {
      'Female': 'BV074_streaming',
      'Male': 'BV075_streaming',
    },
    Other: {
      'Alto': 'en_female_f08_salut_damour',
      'Tenor': 'en_male_m03_lobby',
      'Sunshine Soon': 'en_male_m03_sunshine_soon',
      'Warmy Breeze': 'en_female_f08_warmy_breeze',
      'Glorious': 'en_female_ht_f08_glorious',
      'It Goes Up': 'en_male_sing_funny_it_goes_up',
      'Chipmunk': 'en_male_m2_xhxs_m03_silly',
      'Dramatic': 'en_female_ht_f08_wonderful_world',
    },
  },
];

import googleTTS from 'google-tts-api';

/**
 * Creates an mp3 audio file from text.
 *
 * @param {string} text The text to convert to audio.
 * @param {string} filePath The name of the audio file to create (can include a relative path).
 * @param {string} [language='en'] The language of the text (ISO 639-1 code) (optional, default is English 'en').
 *
 * @returns {Promise<string>} A promise that resolves with the file path when the audio file is created.
 */

class GoogleTTS {
  static async createAudioFile(text: string, filePath: string, language: string = 'en'): Promise<string> {
    const req_text = prepareText(text)
    const base64Array = await googleTTS.getAllAudioBase64(req_text, { lang: language });
    const buffers = base64Array.map((result) => Buffer.from(result.base64, 'base64'));
    const finalBuffer = Buffer.concat(buffers);
    await bun.write(filePath, finalBuffer);
    return filePath;
  }

  /**
   * - Supported Languages
   *  - af - Afrikaans
   *  - sq - Albanian
   *  - de - German
   *  - ar - Arabic
   *  - bn - Bengali
   *  - my - Burmese
   *  - bs - Bosnian
   *  - bg - Bulgarian
   *  - km - Cambodian
   *  - kn - Kannada
   *  - ca - Catalan
   *  - cs - Czech
   *  - zh - Simplified Chinese
   *  - zh-TW - Traditional Chinese
   *  - si - Sinhalese
   *  - ko - Korean
   *  - hr - Croatian
   *  - da - Danish
   *  - sk - Slovak
   *  - es - Spanish
   *  - et - Estonian
   *  - fi - Finnish
   *  - fr - French
   *  - el - Greek
   *  - gu - Gujarati
   *  - hi - Hindi
   *  - nl - Dutch
   *  - hu - Hungarian
   *  - id - Indonesian
   *  - en - English
   *  - is - Icelandic
   *  - it - Italian
   *  - ja - Japanese
   *  - la - Latin
   *  - lv - Latvian
   *  - ml - Malayalam
   *  - ms - Malay
   *  - mr - Marathi
   *  - ne - Nepali
   *  - no - Norwegian
   *  - pl - Polish
   *  - pt - Portuguese
   *  - ro - Romanian
   *  - ru - Russian
   *  - sr - Serbian
   *  - sw - Swahili
   *  - sv - Swedish
   *  - su - Sundanese
   *  - tl - Tagalog
   *  - th - Thai
   *  - ta - Tamil
   *  - te - Telugu
   *  - tr - Turkish
   *  - uk - Ukrainian
   *  - ur - Urdu
   *  - vi - Vietnamese
   */

  /**
   * Gets an mp3 audio buffer from text.
   *
   * @param {string} text The text to convert to audio.
   * @param {string} [language='en'] The language of the text (ISO 639-1 code) (optional).
   *
   * @returns {Promise<Buffer>} A promise that resolves with the mp3 audio buffer.
   * */

  static async getAudioBuffer(text: string, language: string = 'en'): Promise<Buffer> {
    const req_text = prepareText(text)
    const base64Array = await googleTTS.getAllAudioBase64(req_text, { lang: language });
    const buffers = base64Array.map((result) => Buffer.from(result.base64, 'base64'));
    const finalBuffer = Buffer.concat(buffers);
    return finalBuffer;
  }
  /**
   * - Supported Languages
   *  - af - Afrikaans
   *  - sq - Albanian
   *  - de - German
   *  - ar - Arabic
   *  - bn - Bengali
   *  - my - Burmese
   *  - bs - Bosnian
   *  - bg - Bulgarian
   *  - km - Cambodian
   *  - kn - Kannada
   *  - ca - Catalan
   *  - cs - Czech
   *  - zh - Simplified Chinese
   *  - zh-TW - Traditional Chinese
   *  - si - Sinhalese
   *  - ko - Korean
   *  - hr - Croatian
   *  - da - Danish
   *  - sk - Slovak
   *  - es - Spanish
   *  - et - Estonian
   *  - fi - Finnish
   *  - fr - French
   *  - el - Greek
   *  - gu - Gujarati
   *  - hi - Hindi
   *  - nl - Dutch
   *  - hu - Hungarian
   *  - id - Indonesian
   *  - en - English
   *  - is - Icelandic
   *  - it - Italian
   *  - ja - Japanese
   *  - la - Latin
   *  - lv - Latvian
   *  - ml - Malayalam
   *  - ms - Malay
   *  - mr - Marathi
   *  - ne - Nepali
   *  - no - Norwegian
   *  - pl - Polish
   *  - pt - Portuguese
   *  - ro - Romanian
   *  - ru - Russian
   *  - sr - Serbian
   *  - sw - Swahili
   *  - sv - Swedish
   *  - su - Sundanese
   *  - tl - Tagalog
   *  - th - Thai
   *  - ta - Tamil
   *  - te - Telugu
   *  - tr - Turkish
   *  - uk - Ukrainian
   *  - ur - Urdu
   *  - vi - Vietnamese
   */
}

export { GoogleTTS, TikTokTTS };
