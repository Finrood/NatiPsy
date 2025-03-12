import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {BlogPost} from '../models/blog-post.model';
import {marked} from 'marked';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(private http: HttpClient) {}

  calculateReadingTime(content: string): number {
    const wordsPerMinute = 100;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  getPostsList(): Observable<BlogPost[]> {
    return this.http.get<any[]>('/assets/content/blog/index.json')
      .pipe(
        map(posts => posts.map(post => ({
          ...post,
          readTime: post.content ? this.calculateReadingTime(post.content) : null
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

            // Parse frontmatter (improved to handle multi-line arrays)
            const data: Record<string, any> = {};
            let currentKey: string | null = null;
            let inArray = false;
            const lines = frontMatterText.split('\n');

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();

              // Skip empty lines
              if (!line) continue;

              // Check if this is a new key-value pair
              const keyMatch = line.match(/^(\w+):\s*(.*)$/);

              if (keyMatch) {
                currentKey = keyMatch[1];
                const value = keyMatch[2].trim();

                // If there's a value on the same line, use it
                if (value) {
                  // Handle inline arrays [item1, item2]
                  if (value.startsWith('[') && value.endsWith(']')) {
                    data[currentKey] = value.slice(1, -1).split(',').map(v =>
                      v.trim().replace(/^["']|["']$/g, '')
                    );
                    inArray = false;
                  } else {
                    data[currentKey] = value.replace(/^["']|["']$/g, '');
                    inArray = false;
                  }
                } else {
                  // If no value on the same line, check if the next line is an array item
                  const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
                  inArray = nextLine.startsWith('-');

                  if (inArray) {
                    data[currentKey] = [];
                  } else {
                    data[currentKey] = '';
                  }
                }
              }
              // Check if this is an array item
              else if (line.startsWith('-') && currentKey && inArray) {
                if (!Array.isArray(data[currentKey])) {
                  data[currentKey] = [];
                }

                const value = line.substring(1).trim();
                data[currentKey].push(value);
              }
              // Multiline value (not array)
              else if (currentKey && !inArray) {
                data[currentKey] += ' ' + line;
              }
            }

            const parsedContent = marked.parse(content);

            // Ensure categories is always an array
            let categories = data['categories'] || [];
            if (typeof categories === 'string' && categories.trim() !== '') {
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
