import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Video } from '../../models/video.model';
import { VideoService } from '../../services/video.service';

@Component({
  selector: 'app-video-card',
  imports: [CommonModule, DatePipe],
  templateUrl: './video-card.component.html',
  styleUrl: './video-card.component.scss',
})
export class VideoCardComponent {
  @Input({ required: true }) video!: Video;
  @Output() onSelectVideo = new EventEmitter();

  constructor(private videoService: VideoService) {}

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

  selectVideo() {
    this.onSelectVideo.emit(this.video);
  }

  stopPreview(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (video) {
      video.pause();
      video.currentTime = 0; // Reset to beginning
    }
  }

  getVideoStreamUrl(id: string): string {
    return this.videoService.getVideoStreamUrl(id);
  }

  getFormatDuration(seconds: number): string {
    return this.videoService.formatDuration(seconds);
  }

  getFormatFileSize(size: number): string {
    return this.videoService.formatFileSize(size);
  }

  onVideoLoaded(event: Event): void {
    const video = event.target as HTMLVideoElement;
    console.log('Video loaded for:', this.video.title, video?.src);
    if (video) {
      // Set to first frame
      video.currentTime = 0;
    }
  }

  onVideoError(event: Event): void {
    const video = event.target as HTMLVideoElement;
    console.error('Video error for:', this.video.title, video?.error);
  }
}
