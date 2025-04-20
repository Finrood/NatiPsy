import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { BlogPost, BlogPostAuthor } from '../models/blog-post.model';
import { marked } from 'marked';
import matter from 'gray-matter';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private postsCache: BlogPost[] | null = null;
  private postsIndexUrl = '/assets/content/blog/index.json';

  constructor(private http: HttpClient) {}

  private calculateReadingTime(content: string): number {
    if (!content) return 0;
    const wordsPerMinute = 200;
    const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textOnly.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  }

  private handleError(error: HttpErrorResponse, context: string) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(`BlogService Error (${context}):`, error);
    console.error(`BlogService Error Message (${context}):`, errorMessage);
    return throwError(() => new Error(`Failed to ${context}. Please try again later.`));
  }

  private fetchPostsIndex(): Observable<BlogPost[]> {
    if (this.postsCache) {
      return of(this.postsCache);
    }
    return this.http.get<Omit<BlogPost, 'content' | 'readTime'>[]>(this.postsIndexUrl).pipe(
      map(posts => posts.map(post => ({
        ...post,
        date: new Date(post.date),
        content: '',
        readTime: null
      }))),
      map(posts => posts.sort((a, b) => b.date.getTime() - a.date.getTime())),
      tap(posts => this.postsCache = posts),
      catchError(err => this.handleError(err, 'load posts list'))
    );
  }

  getPostsList(
    filterCategory?: string,
    sortBy: keyof Pick<BlogPost, 'date' | 'title'> = 'date',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Observable<BlogPost[]> {
    return this.fetchPostsIndex().pipe(
      map(posts => {
        let filteredPosts = posts;

        if (filterCategory) {
          filteredPosts = filteredPosts.filter(post =>
            post.categories.includes(filterCategory)
          );
        }

        filteredPosts.sort((a, b) => {
          let comparison = 0;
          const valA = a[sortBy];
          const valB = b[sortBy];

          if (valA instanceof Date && valB instanceof Date) {
            comparison = valA.getTime() - valB.getTime();
          } else if (typeof valA === 'string' && typeof valB === 'string') {
            comparison = valA.localeCompare(valB);
          } else if (valA < valB) {
            comparison = -1;
          } else if (valA > valB) {
            comparison = 1;
          }

          return sortDirection === 'desc' ? comparison * -1 : comparison;
        });

        return filteredPosts;
      }),
      catchError(err => this.handleError(err, 'filter or sort posts')) // Already handled in fetchPostsIndex, but good practice
    );
  }

  getAllCategories(): Observable<string[]> {
    return this.fetchPostsIndex().pipe(
      map(posts => {
        const categories = new Set<string>();
        posts.forEach(post => post.categories.forEach(cat => categories.add(cat)));
        return Array.from(categories).sort();
      }),
      catchError(err => this.handleError(err, 'load categories'))
    );
  }


  getPostBySlug(slug: string): Observable<BlogPost | null> {
    const markdownUrl = `/assets/content/blog/${slug}.md`;
    return this.http.get(markdownUrl, { responseType: 'text' })
      .pipe(
        switchMap(async (fileContent) => {
          try {
            const { data, content } = matter(fileContent);

            if (!data['title'] || !data['date']) {
              console.warn(`Markdown file ${slug}.md might be missing required front matter (title, date).`);
            }

            const parsedContent = await marked.parse(content);
            const readingTime = this.calculateReadingTime(content);

            let categories: string[] = [];
            if (Array.isArray(data['categories'])) {
              categories = data['categories'];
            } else if (typeof data['categories'] === 'string' && data['categories'].trim() !== '') {
              categories = data['categories'].split(',').map(c => c.trim()).filter(c => c);
            }

            let author: BlogPostAuthor | undefined = undefined;
            if (data['author']) {
              if (typeof data['author'] === 'string') {
                author = { name: data['author'] };
              } else if (typeof data['author'] === 'object' && data['author'].name) {
                author = {
                  name: data['author'].name,
                  bio: data['author'].bio || undefined,
                  avatar: data['author'].avatar || undefined
                };
              }
            }


            const post: BlogPost = {
              slug,
              title: data['title'] || 'Untitled Post',
              date: data['date'] ? new Date(data['date']) : new Date(),
              description: data['description'] || '',
              image: data['image'] || null,
              categories: categories,
              content: parsedContent,
              readTime: readingTime,
              author: author
            };
            return post;
          } catch (error) {
            console.error(`Error parsing markdown file ${slug}.md:`, error);
            throw new Error(`Failed to parse markdown content for ${slug}.`);
          }
        }),
        catchError(error => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            console.warn(`Blog post not found: ${slug}`);
            return of(null);
          }
          console.error(`Failed to load or process blog post ${slug}:`, error.message || error);
          return throwError(() => new Error(`Could not load post "${slug}". It might not exist or there was a problem.`));
        })
      );
  }

  getRelatedPosts(currentSlug: string, maxPosts: number = 3): Observable<BlogPost[]> {
    return this.getPostBySlug(currentSlug).pipe(
      switchMap(currentPost => {
        if (!currentPost || currentPost.categories.length === 0) {
          return of([]);
        }
        return this.fetchPostsIndex().pipe(
          map(allPosts => {
            return allPosts
              .filter(post => post.slug !== currentSlug)
              .filter(post => post.categories.some(cat => currentPost.categories.includes(cat))) // Find posts with shared categories
              .slice(0, maxPosts);
          })
        );
      }),
      catchError(err => {
        console.error("Error fetching related posts:", err);
        return of([]);
      })
    );
  }
}
