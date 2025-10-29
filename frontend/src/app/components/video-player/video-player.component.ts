import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Video } from '../../models/video.model';
import { VideoService } from '../../services/video.service';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  video: Video | null = null;
  videoId: string | null = null;
  loading = false;
  error: string | null = null;
  streamUrl = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoService: VideoService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.videoId = params['id'];
      if (this.videoId) {
        this.loadVideoInfo();
        this.streamUrl = this.videoService.getVideoStreamUrl(this.videoId);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up any resources if needed
  }

  loadVideoInfo(): void {
    if (!this.videoId) return;

    this.loading = true;
    this.error = null;

    this.videoService.getVideoInfo(this.videoId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.video = response.data;
        } else {
          this.error = response.error || 'Video not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading video info:', err);
        this.error = 'Failed to load video information';
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  formatFileSize(bytes: number): string {
    return this.videoService.formatFileSize(bytes);
  }

  formatDuration(seconds: number): string {
    return this.videoService.formatDuration(seconds);
  }

  onVideoError(): void {
    this.error =
      'Failed to load video. The video file might be corrupted or incompatible.';
  }

  onVideoProgress(event: Event): void {
    // Called when the browser downloads buffered ranges
    const video = event.target as HTMLVideoElement;
    if (video && video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration;
      const bufferedPercent = (bufferedEnd / duration) * 100;
      console.log(`Buffered: ${bufferedPercent.toFixed(1)}%`);
    }
  }
}
