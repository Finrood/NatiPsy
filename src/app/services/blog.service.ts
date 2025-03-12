import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { BlogPost } from '../models/blog-post.model';
import { marked } from 'marked';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(private http: HttpClient) {}

  calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min de leitura`;
  }

  getPostsList(): Observable<BlogPost[]> {
    return this.http.get<any[]>('/assets/content/blog/index.json')
      .pipe(
        map(posts => posts.map(post => ({
          ...post,
          readTime: post.content ? this.calculateReadingTime(post.content) : '3 min de leitura'
        }))),
        map(posts => posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      );
  }

  getPostBySlug(slug: string): Observable<any> {
    return this.http.get(`/assets/content/blog/${slug}.md`, { responseType: 'text' })
      .pipe(
        map(fileContent => {
          try {
            // Simple frontmatter parser
            const frontMatterRegex = /^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/;
            const match = frontMatterRegex.exec(fileContent);

            if (!match) {
              throw new Error('Invalid frontmatter format');
            }

            const frontMatterText = match[1];
            const content = match[2];

            // Parse frontmatter
            const data: Record<string, any> = {};
            frontMatterText.split('\n').forEach(line => {
              const colonIndex = line.indexOf(':');
              if (colonIndex > 0) {
                const key = line.slice(0, colonIndex).trim();
                const rawValue = line.slice(colonIndex + 1).trim();

                // Handle arrays in frontmatter (like categories)
                if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
                  data[key] = rawValue.slice(1, -1).split(',').map(v =>
                    v.trim().replace(/^["']|["']$/g, '')
                  );
                } else {
                  // Remove quotes if present
                  data[key] = rawValue.replace(/^["']|["']$/g, '');
                }
              }
            });

            const parsedContent = marked.parse(content);

            // Ensure categories is always an array
            let categories = data['categories'];
            if (typeof categories === 'string') {
              // If it's a single string, convert to array
              categories = [categories];
            } else if (!Array.isArray(categories)) {
              // If it's undefined or not an array, use empty array
              categories = [];
            }

            return {
              slug,
              title: data['title'],
              date: data['date'],
              description: data['description'],
              image: data['image'],
              categories: categories,
              content: parsedContent,
              readTime: this.calculateReadingTime(content)
            };
          } catch (error) {
            console.error('Error parsing markdown:', error);
            throw error;
          }
        }),
        catchError(error => {
          console.error(`Failed to load blog post ${slug}:`, error);
          return of(null);
        })
      );
  }
}
