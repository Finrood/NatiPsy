import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, switchMap} from 'rxjs';
import {BlogPost} from '../models/blog-post.model';
import {marked} from 'marked';
import matter from 'gray-matter';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(private http: HttpClient) {}

  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const textOnly = content.replace(/<[^>]*>/g, '');
    const words = textOnly.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  getPostsList(): Observable<BlogPost[]> {
    return this.http.get<any[]>('/assets/content/blog/index.json')
      .pipe(
        map(posts => posts.map(post => ({
          ...post,
          readTime: post.content ? this.calculateReadingTime(post.content) : (post.description ? this.calculateReadingTime(post.description) : null)
        }))),
        map(posts => posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      );
  }

  getPostBySlug(slug: string): Observable<BlogPost | null> {
    return this.http.get(`/assets/content/blog/${slug}.md`, { responseType: 'text' })
      .pipe(
        switchMap(async (fileContent) => {
          try {
            const { data, content } = matter(fileContent);

            const parsedContent = await marked.parse(content);
            const readingTime = this.calculateReadingTime(content);

            let categories = data['categories'] || [];
            if (typeof categories === 'string' && categories.trim() !== '') {
              categories = [categories];
            } else if (!Array.isArray(categories)) {
              categories = [];
            }

            const post: BlogPost = {
              slug,
              title: data['title'] || 'Untitled Post',
              date: data['date'] ? new Date(data['date']) : new Date(),
              description: data['description'] || '',
              image: data['image'] || null,
              categories: categories,
              content: parsedContent,
              readTime: readingTime
            };
            return post;
          } catch (error) {
            console.error(`Error parsing markdown file ${slug}.md:`, error);
            throw new Error(`Failed to parse ${slug}.md`);
          }
        }),
        catchError(error => {
          console.error(`Failed to load or parse blog post ${slug}:`, error);
          return of(null);
        })
      );
  }
}
