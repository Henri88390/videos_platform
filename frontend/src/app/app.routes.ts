import { Routes } from '@angular/router';
import { VideoListComponent } from './components/video-list/video-list.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';

export const routes: Routes = [
  {
    path: '',
    component: VideoListComponent,
    title: 'Video Library',
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
