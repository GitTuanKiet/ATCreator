import { AssemblyAI, type TranscriptLanguageCode } from 'assemblyai';
import { apiConfig } from '../config/api';

// Wrapper for AssemblyAI
export default class AssemblyAIWrapper {
  private apiKey: string;
  private client: AssemblyAI;

  constructor() {
    this.apiKey = apiConfig.assemblyaiApi;
    this.client = new AssemblyAI({ apiKey: this.apiKey });
  }

  public async transcriptFile(path: string) {
    console.log(path);
    const response = await this.client.transcripts.transcribe({
      audio: path,
      language_code: 'vi' as TranscriptLanguageCode,
    });

    return response.text;
  }
}
