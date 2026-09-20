import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap } from 'rxjs/operators';
import { BlogPost } from '../models/blog-post.model';

export type BlogErrorKind = 'not-found' | 'offline' | 'server' | 'invalid-content';

export class BlogServiceError extends Error {
  constructor(
    readonly kind: BlogErrorKind,
    readonly context: string,
    options?: { cause?: unknown },
  ) {
    super(kind, options);
    this.name = 'BlogServiceError';
  }
}

export const BLOG_ERROR_MESSAGES: Record<BlogErrorKind, string> = {
  'not-found': 'Não encontramos este conteúdo.',
  offline: 'Não foi possível conectar. Verifique sua internet e tente novamente.',
  server: 'O conteúdo está temporariamente indisponível. Tente novamente em instantes.',
  'invalid-content': 'Não foi possível ler este conteúdo. Tente novamente mais tarde.',
};

@Injectable({ providedIn: 'root' })
export class BlogService {
  private postsCache: BlogPost[] | null = null;
  private postsIndexRequest$: Observable<BlogPost[]> | null = null;
  private postsIndexUrl = '/assets/content/blog/index.json';

  constructor(private http: HttpClient) {}

  private handleError(error: unknown, context: string) {
    const blogError = this.toBlogError(error, context);
    if (!(error instanceof BlogServiceError)) {
      const status = error instanceof HttpErrorResponse ? error.status : undefined;
      console.error('BlogService request failed', { context, kind: blogError.kind, status });
    }
    return throwError(() => blogError);
  }

  private toBlogError(error: unknown, context: string): BlogServiceError {
    if (error instanceof BlogServiceError) return error;
    let kind: BlogErrorKind = 'invalid-content';
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) kind = 'offline';
      else if (error.status >= 500) kind = 'server';
      else if (error.status === 404) kind = 'not-found';
    }
    return new BlogServiceError(kind, context, { cause: error });
  }

  private reviveIndex(raw: Omit<BlogPost, 'content' | 'readTime'>[]): BlogPost[] {
    return raw
      .map(post => ({
        ...post,
        date: new Date(post.date),
        dateOnly: post.dateOnly ?? new Date(post.date).toISOString().slice(0, 10),
        tags: [...(post.tags ?? [])],
        categoryDetails: [...(post.categoryDetails ?? [])],
        content: '',
        readTime: null as number | null,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime() || a.slug.localeCompare(b.slug));
  }

  private clonePost(post: BlogPost): BlogPost {
    return {
      ...post,
      date: new Date(post.date.getTime()),
      categories: [...post.categories],
      tags: [...(post.tags ?? [])],
      categoryDetails: (post.categoryDetails ?? []).map(category => ({ ...category })),
      author: post.author ? { ...post.author } : post.author,
    };
  }

  private fetchPostsIndex(): Observable<BlogPost[]> {
    if (this.postsCache) return of(this.postsCache);
    if (this.postsIndexRequest$) return this.postsIndexRequest$;

    // Angular's default HTTP transfer cache owns SSR-to-client hydration;
    // this service only owns the in-memory request sharing and retry state.
    this.postsIndexRequest$ = this.http.get<Omit<BlogPost, 'content' | 'readTime'>[]>(this.postsIndexUrl).pipe(
        map(posts => {
          if (!Array.isArray(posts)) throw new Error('Blog index must be an array.');
          return this.reviveIndex(posts);
        }),
        map(posts => {
          this.postsCache = posts;
          return posts;
        }),
        catchError(error => this.handleError(error, 'load posts list')),
        finalize(() => {
          this.postsIndexRequest$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    return this.postsIndexRequest$;
  }

  getPostsList(
    filterCategory?: string,
    sortBy: keyof Pick<BlogPost, 'date' | 'title'> = 'date',
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Observable<BlogPost[]> {
    return this.fetchPostsIndex().pipe(
      map(posts => {
        let filteredPosts = [...posts];
        if (filterCategory) filteredPosts = filteredPosts.filter(post => post.categories.includes(filterCategory));
        filteredPosts.sort((a, b) => {
          const valA = a[sortBy];
          const valB = b[sortBy];
          let comparison = 0;
          if (valA instanceof Date && valB instanceof Date) comparison = valA.getTime() - valB.getTime();
          else if (typeof valA === 'string' && typeof valB === 'string') comparison = valA.localeCompare(valB);
          else if (valA < valB) comparison = -1;
          else if (valA > valB) comparison = 1;
          const directionComparison = sortDirection === 'desc' ? comparison * -1 : comparison;
          return directionComparison || a.slug.localeCompare(b.slug);
        });
        return filteredPosts.map(post => this.clonePost(post));
      }),
      catchError(error => this.handleError(error, 'filter or sort posts')),
    );
  }

  getAllCategories(): Observable<string[]> {
    return this.fetchPostsIndex().pipe(
      map(posts => Array.from(new Set(posts.flatMap(post => post.categories))).sort()),
      catchError(error => this.handleError(error, 'load categories')),
    );
  }

  getPostBySlug(slug: string): Observable<BlogPost | null> {
    return this.fetchPostsIndex().pipe(
      switchMap(index => index.some(post => post.slug === slug) ? this.fetchPostJson(slug) : of(null)),
      catchError(error => this.handleError(error, `load post ${slug}`)),
    );
  }

  private fetchPostJson(slug: string): Observable<BlogPost | null> {
    const postUrl = `/assets/content/blog/posts/${slug}.json`;
    return this.http.get<BlogPost>(postUrl).pipe(
      map(post => ({
        ...post,
        date: new Date(post.date),
        dateOnly: post.dateOnly ?? new Date(post.date).toISOString().slice(0, 10),
      })),
      catchError(error => this.handleError(error, `load post ${slug}`)),
    );
  }

  getRelatedPosts(currentSlug: string, categories?: string[], maxPosts: number = 3): Observable<BlogPost[]> {
    const findRelated = (cats: string[]) => {
      if (!cats || cats.length === 0) return of([]);
      return this.fetchPostsIndex().pipe(
        map(allPosts => allPosts
          .filter(post => post.slug !== currentSlug)
          .filter(post => post.categories.some(category => cats.includes(category)))
          .map(post => ({
            post,
            sharedCategories: post.categories.filter(category => cats.includes(category)).length,
          }))
          .sort((a, b) => b.sharedCategories - a.sharedCategories ||
            b.post.date.getTime() - a.post.date.getTime() || a.post.slug.localeCompare(b.post.slug))
          .slice(0, maxPosts)
          .map(({ post }) => this.clonePost(post))),
      );
    };
    if (categories && categories.length > 0) return findRelated(categories);
    return this.getPostBySlug(currentSlug).pipe(
      switchMap(currentPost => findRelated(currentPost?.categories || [])),
      catchError(() => of([])),
    );
  }
}
