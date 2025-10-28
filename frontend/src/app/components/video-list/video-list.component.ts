import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Video } from '../../models/video.model';
import { VideoService } from '../../services/video.service';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-list.component.html',
  styleUrl: './video-list.component.scss',
})
export class VideoListComponent implements OnInit {
  videos: Video[] = [];
  loading = false;
  error: string | null = null;

  constructor(private videoService: VideoService, private router: Router) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  loadVideos(): void {
    this.loading = true;
    this.error = null;

    this.videoService.getVideos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.videos = response.data;
        } else {
          this.error = response.error || 'Failed to load videos';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading videos:', err);
        this.error =
          'Failed to connect to the server. Make sure the backend is running on port 3000.';
        this.loading = false;
      },
    });
  }

  selectVideo(video: Video): void {
    this.router.navigate(['/video', video.id]);
  }

  formatFileSize(bytes: number): string {
    return this.videoService.formatFileSize(bytes);
  }

  formatDuration(seconds: number): string {
    return this.videoService.formatDuration(seconds);
  }

  refreshVideos(): void {
    this.loadVideos();
  }

  goToUpload(): void {
    this.router.navigate(['/upload']);
  }

  getVideoStreamUrl(videoId: string): string {
    return this.videoService.getVideoStreamUrl(videoId);
  }

  startPreview(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (video && video.readyState >= 2) {
      // HAVE_CURRENT_DATA
      video.currentTime = 0; // Start from beginning
      video.play().catch(() => {
        // Ignore play errors (autoplay restrictions)
      });
    }
  }

  stopPreview(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (video) {
      video.pause();
      video.currentTime = 0; // Reset to beginning
    }
  }

  onVideoLoaded(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (video) {
      // Set to first frame
      video.currentTime = 0;
    }
  }
}
