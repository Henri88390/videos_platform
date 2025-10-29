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
  @Input() showPreview: boolean = true;
  @Output() onSelectVideo = new EventEmitter();
  @Output() onDeleteVideo = new EventEmitter<string>();

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

  deleteVideo(event: Event) {
    event.stopPropagation(); // Prevent card selection when clicking delete

    if (confirm(`Are you sure you want to delete "${this.video.title}"?`)) {
      this.videoService.deleteVideo(this.video.id).subscribe({
        next: (response) => {
          console.log('Video deleted successfully:', response.message);
          this.onDeleteVideo.emit(this.video.id);
        },
        error: (error) => {
          console.error('Error deleting video:', error);
          alert('Failed to delete video. Please try again.');
        },
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

  getVideoFormat(): string {
    const filename = this.video.filename || '';
    const extension = filename.split('.').pop()?.toUpperCase();
    return extension || 'VIDEO';
  }
}
