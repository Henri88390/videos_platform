import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Video } from '../models/video.model';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private readonly baseUrl = 'http://localhost:3000/api/video';

  constructor(private http: HttpClient) {}

  /**
   * Get list of all available videos
   */
  getVideos(): Observable<ApiResponse<Video[]>> {
    return this.http.get<ApiResponse<Video[]>>(this.baseUrl);
  }

  /**
   * Get detailed information about a specific video
   */
  getVideoInfo(videoId: string): Observable<ApiResponse<Video>> {
    return this.http.get<ApiResponse<Video>>(`${this.baseUrl}/${videoId}/info`);
  }

  /**
   * Get the streaming URL for a video
   */
  getVideoStreamUrl(videoId: string): string {
    return `${this.baseUrl}/${videoId}/stream`;
  }

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration in human readable format
   */
  formatDuration(seconds: number): string {
    if (seconds === 0) return 'Unknown';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
}
