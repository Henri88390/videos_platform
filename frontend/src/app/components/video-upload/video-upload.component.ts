import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Video } from '../../models/video.model';
import { VideoService } from '../../services/video.service';

interface UploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  message?: string;
  uploadedVideo?: Video;
}

@Component({
  selector: 'app-video-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-upload.component.html',
  styleUrl: './video-upload.component.scss',
})
export class VideoUploadComponent {
  isDragOver = false;
  uploadStatuses: UploadStatus[] = [];
  isUploading = false;
  maxFileSize = 500 * 1024 * 1024; // 500MB
  maxFiles = 5;

  constructor(private videoService: VideoService, private router: Router) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.handleFiles(files);

    // Clear the input so the same file can be selected again
    input.value = '';
  }

  handleFiles(files: File[]): void {
    const videoFiles = files.filter((file) => this.isVideoFile(file));

    if (videoFiles.length === 0) {
      alert(
        'Please select video files only. Supported formats: MP4, AVI, MOV, WMV, FLV, WEBM, MKV'
      );
      return;
    }

    if (videoFiles.length > this.maxFiles) {
      alert(`Maximum ${this.maxFiles} files allowed`);
      return;
    }

    const oversizedFiles = videoFiles.filter(
      (file) => file.size > this.maxFileSize
    );
    if (oversizedFiles.length > 0) {
      alert(
        `Some files are too large. Maximum size is ${this.formatFileSize(
          this.maxFileSize
        )}`
      );
      return;
    }

    // Add files to upload queue
    const newStatuses: UploadStatus[] = videoFiles.map((file) => ({
      file,
      status: 'pending',
      progress: 0,
    }));

    this.uploadStatuses = [...this.uploadStatuses, ...newStatuses];
  }

  isVideoFile(file: File): boolean {
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/x-msvideo',
      'video/quicktime',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/webm',
      'video/x-matroska',
    ];

    const allowedExtensions = [
      '.mp4',
      '.avi',
      '.mov',
      '.wmv',
      '.flv',
      '.webm',
      '.mkv',
    ];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    return allowedTypes.includes(file.type) || hasValidExtension;
  }

  uploadFiles(): void {
    const pendingFiles = this.uploadStatuses.filter(
      (status) => status.status === 'pending'
    );

    if (pendingFiles.length === 0) {
      return;
    }

    this.isUploading = true;

    // Upload files one by one to avoid overwhelming the server
    this.uploadNext(0);
  }

  private uploadNext(index: number): void {
    const pendingFiles = this.uploadStatuses.filter(
      (status) => status.status === 'pending'
    );

    if (index >= pendingFiles.length) {
      this.isUploading = false;
      return;
    }

    const status = pendingFiles[index];
    status.status = 'uploading';
    status.progress = 0;

    this.videoService.uploadVideo(status.file).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          status.status = 'success';
          status.progress = 100;
          status.message = response.message;
          status.uploadedVideo = response.data;
        } else {
          status.status = 'error';
          status.message = response.error || 'Upload failed';
        }

        // Upload next file
        setTimeout(() => this.uploadNext(index + 1), 500);
      },
      error: (error) => {
        status.status = 'error';
        status.message = error.error?.error || error.message || 'Upload failed';

        // Upload next file
        setTimeout(() => this.uploadNext(index + 1), 500);
      },
    });
  }

  removeFile(index: number): void {
    this.uploadStatuses.splice(index, 1);
  }

  clearCompleted(): void {
    this.uploadStatuses = this.uploadStatuses.filter(
      (status) => status.status !== 'success' && status.status !== 'error'
    );
  }

  clearAll(): void {
    if (this.isUploading) {
      if (
        !confirm(
          'Upload is in progress. Are you sure you want to clear all files?'
        )
      ) {
        return;
      }
    }
    this.uploadStatuses = [];
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  formatFileSize(bytes: number): string {
    return this.videoService.formatFileSize(bytes);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'uploading':
        return '📤';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📄';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return '#6c757d';
      case 'uploading':
        return '#007bff';
      case 'success':
        return '#28a745';
      case 'error':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  hasAnyFiles(): boolean {
    return this.uploadStatuses.length > 0;
  }

  hasPendingFiles(): boolean {
    return this.uploadStatuses.some((status) => status.status === 'pending');
  }

  hasCompletedFiles(): boolean {
    return this.uploadStatuses.some(
      (status) => status.status === 'success' || status.status === 'error'
    );
  }

  viewVideo(videoId: string): void {
    this.router.navigate(['/video', videoId]);
  }

  get completedCount(): number {
    return this.uploadStatuses.filter((s) => s.status === 'success').length;
  }

  get failedCount(): number {
    return this.uploadStatuses.filter((s) => s.status === 'error').length;
  }

  get remainingCount(): number {
    return this.uploadStatuses.filter(
      (s) => s.status === 'pending' || s.status === 'uploading'
    ).length;
  }
}
