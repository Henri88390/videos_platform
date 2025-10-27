import { Routes } from '@angular/router';
import { VideoListComponent } from './components/video-list/video-list.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VideoUploadComponent } from './components/video-upload/video-upload.component';

export const routes: Routes = [
  {
    path: '',
    component: VideoListComponent,
    title: 'Video Library',
  },
  {
    path: 'upload',
    component: VideoUploadComponent,
    title: 'Upload Videos',
  },
  {
    path: 'video/:id',
    component: VideoPlayerComponent,
    title: 'Video Player',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
