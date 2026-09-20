import {SafeHtml} from '@angular/platform-browser';
import {SITE_URL} from '../config/contact';

export interface BlogPostAuthor {
  name: string;
  bio?: string;
  avatar?: string;
}

export interface BlogHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** Optional concise discovery title; the editorial title remains the page h1. */
  seoTitle?: string;
  /** Optional concise search description with the editorial description as fallback. */
  seoDescription?: string;
  socialTitle?: string;
  socialDescription?: string;
  date: Date;
  /** Calendar date from frontmatter; deliberately not a local timestamp. */
  dateOnly?: string;
  description: string;
  image: string | null;
  imageWidth?: number;
  imageHeight?: number;
  categories: string[];
  content: string | SafeHtml;
  readTime: number | null;
  headings?: BlogHeading[];

  author?: BlogPostAuthor;
}

export function blogDateOnly(post: Pick<BlogPost, 'date' | 'dateOnly'>): string {
  return post.dateOnly ?? post.date.toISOString().slice(0, 10);
}

export function formatBlogDate(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utcDate);
}

const BLOG_IMAGES_BASE_PATH = '/assets/content/blog/images';

export function blogImageUrl(relativePath: string | null | undefined): string {
  if (!relativePath) {
    return '';
  }
  return relativePath.startsWith('/')
    ? relativePath
    : `${BLOG_IMAGES_BASE_PATH}/${relativePath}`;
}

export function blogAbsoluteImageUrl(relativePath: string | null | undefined, baseUrl: string = SITE_URL): string {
  return relativePath
    ? `${baseUrl}${blogImageUrl(relativePath)}`
    : `${baseUrl}/assets/NatiHero.webp`;
}
