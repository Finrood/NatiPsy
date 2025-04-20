import {SafeHtml} from '@angular/platform-browser';

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
