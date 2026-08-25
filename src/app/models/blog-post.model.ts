import {SafeHtml} from '@angular/platform-browser';
import {SITE_URL} from '../config/contact';

export interface BlogPostAuthor {
  name: string;
  bio?: string;
  avatar?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: Date;
  description: string;
  image: string | null;
  categories: string[];
  content: string | SafeHtml;
  readTime: number | null;

  author?: BlogPostAuthor;
}

const BLOG_IMAGES_BASE_PATH = '/assets/content/blog/images';

export function blogImageUrl(relativePath: string | null | undefined): string {
  return relativePath ? `${BLOG_IMAGES_BASE_PATH}/${relativePath}` : '';
}

export function blogAbsoluteImageUrl(relativePath: string | null | undefined, baseUrl: string = SITE_URL): string {
  return relativePath
    ? `${baseUrl}${blogImageUrl(relativePath)}`
    : `${baseUrl}/assets/NatiHero.webp`;
}
