import { createClient } from 'pexels';
import { apiConfig } from '../config/api';

// Wrapper for Pexels
export default class Pexels {
  private apiKey: string;
  private client: any;

  constructor() {
    this.apiKey = apiConfig.pexelsApi;
    this.client = createClient(this.apiKey);
  }

  public async popularVideos(): Promise<Array<JSON>> {
    try {
      const result = await this.client.videos.popular();
      return result.videos.map((video: any) => {
        return {
          id: video.id,
          url: video.video_files[0].link,
          image: video.image,
          duration: video.duration,
        };
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  public async searchVideos(query: string): Promise<Array<JSON>> {
    try {
      const result = await this.client.videos.search({
        query: query,
        per_page: 10,
        page: 1,
      });

      return result.videos.map((video: any) => {
        return {
          id: video.id,
          url: video.video_files[0].link,
          image: video.image,
          duration: video.duration,
        };
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
