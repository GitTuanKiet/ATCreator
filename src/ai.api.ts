import { config } from './config'

import { AssemblyAI, type TranscriptLanguageCode } from 'assemblyai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from 'pexels';

const transcriptAssemblyAI = async (path: string) => {
  const client = new AssemblyAI({ apiKey: config.assemblyaiApi });
  const response = await client.transcripts.transcribe({
    audio: path,
    language_code: 'vi' as TranscriptLanguageCode,
  });

  return response.text;
}

interface resultFreeSound {
  id: number;
  link:string;
}

const fetchSoundFreeSound = async (number: number = 5) => {
  let arr: Array<resultFreeSound> = [];
  const token = config.freesoundApi;

  for (let i = 0; i < number; i++) {
    const random = Math.floor(Math.random() * 115881) + 6;
    const url = `https://freesound.org/apiv2/sounds/${random}/?fields=id,url,previews&token=${token}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.previews)
        arr.push({
          id: data.id,
          link: data.previews['preview-hq-mp3']
        });
      else
        i--;
    } catch (error) {
      console.error('Error fetching sound from FreeSound', error);
    }
  }
  
  console.log('Fetch FreeSound =>', arr.length);
  return arr;
}

const role = `
(All must be in Vietnamese).
(Just write a paragraph to say).
(No title required, no captions allowed).
(The number of words must be equal to the value of DURATION). For example: DURATION = 10, the number of words in the paragraph must be 10.
(Only answer the content, for example the script is "This is the content!" then the answer is just "This is the content", no ", no !).
(Do not add anything other than the paragraph).
`;

const generateContentGenAI = async (query: string, path?: string, mimeType?: string) => {
  const genAI = new GoogleGenerativeAI(config.geminiApi);
  let model: string = 'gemini-pro'
  let prompt: string | [string, { inlineData: { data: string, mimeType: string } }] = query;
  if (path && mimeType) {
    model = 'gemini-pro-vision'
    prompt = [query, { inlineData: { data: Buffer.from(path).toString('base64'), mimeType } }]
  }
  try {
    const modelAI = genAI.getGenerativeModel({ model });
  
    const chat = modelAI.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: role }],
        },
        {
          role: "model",
          parts: [{ text: "OK" }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
    
    let text: string = '';
    const result = await chat.sendMessage(prompt);

    if (result)
      text = result.response.text();

    console.log('Generate GenAI =>', text);
    return text;
  } catch (error) {
    console.error('Error generating content from GenAI', error);
  }
}

interface resultPexels {
  id: number;
  width: number;
  height: number;
  link: string;
  image: string;
  duration: number;
}
  
const fetchVideoPexels= async (query: string) => {
  const client = createClient(config.pexelsApi);
  try {
    let result: any = null;
    const per_page = Math.floor(Math.random() * 20) + 1;
    const page = Math.floor(Math.random() * 10) + 1;
    if (query) 
      result = await client.videos.search({ query: query, per_page, page });
    else
      result = await client.videos.popular({ per_page, page });

    const arr: Array<resultPexels> = [];
    if (result) 
      result.videos.map((video: any) => {
        const width = video.width;
        const height = video.height;
        const video_files = video.video_files.filter((file: any) => file.quality === 'hd' && file.width === width && file.height === height);
        if (video_files.length) 
          arr.push({
            id: video.id,
            width,
            height,
            link: video_files[0].link,
            image: video.image,
            duration: video.duration
          });
      });
    
    console.log('Fetch Pexels =>', arr.length);
    return arr;
  } catch (error) {
    console.error('Error fetching video from Pexels', error);
  }
}

export { transcriptAssemblyAI, fetchSoundFreeSound, generateContentGenAI, fetchVideoPexels };