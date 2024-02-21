import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { apiConfig } from '../config/api';
import Chalk from '../libs/chalk';
import fs from 'fs-extra';

const role = `
(All must be in English).
(Just write a paragraph to say).
(No title required, no captions allowed).
(Automatically wrap each sentence with '\n',each line must not exceed 10 words).
(The number of words must be equivalent to the value of DURATION) For example: DURATION = 10, the number of words in the poem must be between 8-13.
(Only answer the content, for example the script is "This is the content!" then the answer is just "This is the content", no ", no !).
(Do not add anything other than the paragraph).
`;

function fileToGenerativePart(path: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString('base64'),
      mimeType,
    },
  };
}

// Wrapper for Google Generative AI
export default class GeMini {
  private genAI: GoogleGenerativeAI;
  public model!: GenerativeModel;

  constructor() {
    this.genAI = new GoogleGenerativeAI(apiConfig.geminiApi);
  }

  public async Pro(prompt: string) {
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    try {
      const result = await this.model.generateContent(role + prompt);
      return result.response.text();
    } catch (error) {
      Chalk.error('Error generating content');
      return error;
    }
  }

  public async ProVisions(prompt: string, path: string, mimeType: string) {
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    try {
      const result = await this.model.generateContent([role + prompt, fileToGenerativePart(path, mimeType)]);
      return result.response.text();
    } catch (error) {
      Chalk.error('Error generating content');
      return error;
    }
  }
}
