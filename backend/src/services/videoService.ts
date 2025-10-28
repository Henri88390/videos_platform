import { Video } from "../generated/prisma/client.js";
import prisma from "./database.js";

export interface CreateVideoData {
  title: string;
  description?: string;
  filename: string;
  originalName?: string;
  mimetype?: string;
  size: number;
  duration?: number;
}

export interface UpdateVideoData {
  title?: string;
  description?: string;
  duration?: number;
}

export class VideoService {
  /**
   * Create a new video record in the database
   */
  async createVideo(data: CreateVideoData): Promise<Video> {
    return await prisma.video.create({
      data: {
        title: data.title,
        description: data.description || `Video file: ${data.filename}`,
        filename: data.filename,
        originalName: data.originalName,
        mimetype: data.mimetype,
        size: data.size,
        duration: data.duration || 0,
      },
    });
  }

  /**
   * Get all videos from the database
   */
  async getAllVideos(): Promise<Video[]> {
    return await prisma.video.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get a video by ID
   */
  async getVideoById(id: string): Promise<Video | null> {
    return await prisma.video.findUnique({
      where: { id },
    });
  }

  /**
   * Get a video by filename
   */
  async getVideoByFilename(filename: string): Promise<Video | null> {
    return await prisma.video.findUnique({
      where: { filename },
    });
  }

  /**
   * Update a video
   */
  async updateVideo(id: string, data: UpdateVideoData): Promise<Video> {
    return await prisma.video.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a video
   */
  async deleteVideo(id: string): Promise<Video> {
    return await prisma.video.delete({
      where: { id },
    });
  }

  /**
   * Check if a video exists by filename
   */
  async videoExistsByFilename(filename: string): Promise<boolean> {
    const video = await prisma.video.findUnique({
      where: { filename },
      select: { id: true },
    });
    return !!video;
  }

  /**
   * Search videos by title or description
   */
  async searchVideos(query: string): Promise<Video[]> {
    return await prisma.video.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
            },
          },
          {
            description: {
              contains: query,
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const videoService = new VideoService();
