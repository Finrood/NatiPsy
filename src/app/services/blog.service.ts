import { Injectable, PLATFORM_ID, TransferState, inject, makeStateKey } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
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

const POSTS_INDEX_KEY = makeStateKey<Omit<BlogPost, 'content' | 'readTime'>[]>('blog-posts-index');
const postKey = (slug: string) => makeStateKey<BlogPost>(`blog-post-${slug}`);

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private postsCache: BlogPost[] | null = null;
  private postsIndexRequest$: Observable<BlogPost[]> | null = null;
  private postsIndexUrl = '/assets/content/blog/index.json';

  private readonly transferState = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isServer = isPlatformServer(this.platformId);

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
    if (error instanceof BlogServiceError) {
      return error;
    }

    let kind: BlogErrorKind = 'invalid-content';
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        kind = 'offline';
      } else if (error.status >= 500) {
        kind = 'server';
      } else if (error.status === 404) {
        kind = 'not-found';
      }
    }
    return new BlogServiceError(kind, context, { cause: error });
  }

  private reviveIndex(raw: Omit<BlogPost, 'content' | 'readTime'>[]): BlogPost[] {
    return raw
      .map(post => ({
        ...post,
        date: new Date(post.date),
        content: '',
        readTime: null as number | null,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private fetchPostsIndex(): Observable<BlogPost[]> {
    // Client hydration: reuse the index rendered on the server synchronously,
    // so the first paint already matches the SSR DOM (no loading flash, no
    // change-detection race with hydration).
    if (this.transferState.hasKey(POSTS_INDEX_KEY)) {
      const raw = this.transferState.get(POSTS_INDEX_KEY, []);
      this.transferState.remove(POSTS_INDEX_KEY);
      this.postsCache = this.reviveIndex(raw);
      return of(this.postsCache);
    }
    if (this.postsCache) {
      if (this.isServer) {
        this.transferState.set(POSTS_INDEX_KEY, this.postsCache);
      }
      return of(this.postsCache);
    }
    if (this.postsIndexRequest$) {
      return this.postsIndexRequest$;
    }
    const request$ = this.http.get<Omit<BlogPost, 'content' | 'readTime'>[]>(this.postsIndexUrl).pipe(
      map(posts => {
        if (!Array.isArray(posts)) {
          throw new Error('Blog index must be an array.');
        }
        return posts;
      }),
      map(posts => posts.map(post => ({
        ...post,
        date: new Date(post.date),
        content: '',
        readTime: null
      }))),
      map(posts => posts.sort((a, b) => b.date.getTime() - a.date.getTime())),
      tap(posts => {
        this.postsCache = posts;
        if (this.isServer) {
          this.transferState.set(POSTS_INDEX_KEY, posts);
        }
      }),
      catchError(err => this.handleError(err, 'load posts list')),
      tap({ error: () => { this.postsIndexRequest$ = null; } }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    this.postsIndexRequest$ = request$;
    return request$;
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
      })
    );
  }

  getAllCategories(): Observable<string[]> {
    return this.fetchPostsIndex().pipe(
      map(posts => {
        const categories = new Set<string>();
        posts.forEach(post => post.categories.forEach(cat => categories.add(cat)));
        return Array.from(categories).sort();
      })
    );
  }


  getPostBySlug(slug: string): Observable<BlogPost | null> {
    // Client hydration: the server already fetched + rendered this post, so
    // reuse it synchronously instead of refetching (avoids wiping the SSR DOM
    // with a loading state that never recovers due to hydration timing).
    if (this.transferState.hasKey(postKey(slug))) {
      const raw = this.transferState.get(postKey(slug), null);
      this.transferState.remove(postKey(slug));
      if (!raw) {
        return of(null);
      }
      return of({ ...raw, date: new Date(raw.date) });
    }
    // Check the post index first: unknown slugs return `null` immediately,
    // avoiding a pointless markdown request (and nested SSR fetches for
    // routes that don't exist).
    return this.fetchPostsIndex().pipe(
      switchMap(index =>
        index.some(post => post.slug === slug)
          ? this.fetchPostJson(slug)
          : of(null)
      ),
      tap(post => {
        if (this.isServer && post) {
          this.transferState.set(postKey(slug), post);
        }
      }),
      catchError(err => {
        return this.handleError(err, `load post ${slug}`);
      })
    );
  }

  /**
   * Post bodies are pre-rendered to HTML at build time
   * (see `src/scripts/generate-blog-index.js`), so the client fetches a
   * small JSON document instead of parsing Markdown in the browser. This
   * keeps `marked`, `gray-matter` and the Node `buffer` polyfill out of
   * the client bundle entirely.
   */
  private fetchPostJson(slug: string): Observable<BlogPost | null> {
    const postUrl = `/assets/content/blog/posts/${slug}.json`;
    return this.http.get<BlogPost>(postUrl)
      .pipe(
        map((post) => ({
          ...post,
          date: new Date(post.date),
        })),
        catchError(error => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            return of(null);
          }
          return this.handleError(error, `load post ${slug}`);
        })
      );
  }

  getRelatedPosts(currentSlug: string, categories?: string[], maxPosts: number = 3): Observable<BlogPost[]> {
    const findRelated = (cats: string[]) => {
      if (!cats || cats.length === 0) {
        return of([]);
      }
      return this.fetchPostsIndex().pipe(
        map(allPosts => {
          return allPosts
            .filter(post => post.slug !== currentSlug)
            .filter(post => post.categories.some(cat => cats.includes(cat)))
            .slice(0, maxPosts);
        })
      );
    };

    if (categories && categories.length > 0) {
      return findRelated(categories);
    }

    return this.getPostBySlug(currentSlug).pipe(
      switchMap(currentPost => findRelated(currentPost?.categories || [])),
      catchError(() => of([]))
    );
  }
}
