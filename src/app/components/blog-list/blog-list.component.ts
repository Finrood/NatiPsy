import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import {
  CommonModule,
  NgOptimizedImage,
  isPlatformBrowser,
} from '@angular/common';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, forkJoin, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../services/blog.service';
import {
  BlogPost,
  blogDateOnly,
  blogImageUrl,
  formatBlogDate,
} from '../../models/blog-post.model';
import { SeoService } from '../../services/seo.service';
import { SITE_URL } from '../../config/contact';

export type BlogSortBy = keyof Pick<BlogPost, 'date' | 'title'>;
export type BlogSortDirection = 'asc' | 'desc';

export interface BlogQueryState {
  page: number;
  category: string;
  sortBy: BlogSortBy;
  sortDirection: BlogSortDirection;
}

interface BlogContentState {
  posts: BlogPost[];
  categories: string[];
  loading: boolean;
  error: string | null;
}

interface BlogListViewModel extends BlogContentState, BlogQueryState {
  displayedPosts: BlogPost[];
  totalItems: number;
  totalPages: number;
}

const validSortFields = new Set<BlogSortBy>(['date', 'title']);
const validSortDirections = new Set<BlogSortDirection>(['asc', 'desc']);

const initialQueryState: BlogQueryState = {
  page: 1,
  category: '',
  sortBy: 'date',
  sortDirection: 'desc',
};

const initialContentState: BlogContentState = {
  posts: [],
  categories: [],
  loading: true,
  error: null,
};

function firstQueryValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositivePage(value: unknown): number {
  const raw = firstQueryValue(value);
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return 1;
  const page = Number(raw);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function parseBlogQueryParams(params: Params): BlogQueryState {
  const sortByValue = firstQueryValue(params['sortBy']);
  const sortDirectionValue = firstQueryValue(params['sortDir']);
  return {
    page: parsePositivePage(params['page']),
    category:
      typeof firstQueryValue(params['category']) === 'string'
        ? (firstQueryValue(params['category']) as string)
        : '',
    sortBy:
      typeof sortByValue === 'string' && validSortFields.has(sortByValue as BlogSortBy)
        ? (sortByValue as BlogSortBy)
        : 'date',
    sortDirection:
      typeof sortDirectionValue === 'string' &&
      validSortDirections.has(sortDirectionValue as BlogSortDirection)
        ? (sortDirectionValue as BlogSortDirection)
        : 'desc',
  };
}

export function blogQueryParams(
  state: BlogQueryState,
): Record<string, string | number | null> {
  return {
    page: state.page > 1 ? state.page : null,
    category: state.category || null,
    sortBy: state.sortBy !== 'date' ? state.sortBy : null,
    sortDir: state.sortDirection !== 'desc' ? state.sortDirection : null,
  };
}

export function normalizeBlogQueryState(
  state: BlogQueryState,
  maxPage: number,
  categories: string[],
): BlogQueryState {
  return {
    ...state,
    page: Math.min(Math.max(1, state.page), Math.max(1, maxPage)),
    category: state.category && categories.includes(state.category) ? state.category : '',
  };
}

function sameQueryValue(rawValue: unknown, normalizedValue: string | number | null): boolean {
  const value = firstQueryValue(rawValue);
  if (normalizedValue === null) return value === undefined;
  return String(value) === String(normalizedValue);
}

function sameQuery(a: BlogQueryState, b: BlogQueryState): boolean {
  return a.page === b.page && a.category === b.category &&
    a.sortBy === b.sortBy && a.sortDirection === b.sortDirection;
}

function queryIsCanonical(
  params: Params,
  serialized: Record<string, string | number | null>,
): boolean {
  const keys = new Set(Object.keys(serialized));
  return Object.keys(params).every((key) => keys.has(key)) &&
    Object.entries(serialized).every(([key, value]) => sameQueryValue(params[key], value));
}

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgOptimizedImage],
  templateUrl: './blog-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly seoService = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  /** Whether the first archive card is an above-the-fold LCP candidate. */
  @Input() firstImagePriority?: boolean;

  readonly itemsPerPage = 6;
  protected readonly imageUrl = blogImageUrl;
  protected readonly dateOnly = blogDateOnly;
  protected readonly formatDate = formatBlogDate;

  get shouldPrioritizeFirstImage(): boolean {
    return this.firstImagePriority ?? this.router.url.startsWith('/blog');
  }

  private readonly rawQueryParams$ = this.route.queryParams.pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  private readonly queryState$ = this.rawQueryParams$.pipe(
    map(parseBlogQueryParams),
    distinctUntilChanged(sameQuery),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  private readonly filterState$ = this.queryState$.pipe(
    map(({ category, sortBy, sortDirection }) => ({ category, sortBy, sortDirection })),
    distinctUntilChanged((a, b) => a.category === b.category &&
      a.sortBy === b.sortBy && a.sortDirection === b.sortDirection),
  );
  private readonly contentState$ = this.filterState$.pipe(
    switchMap((filters) => forkJoin({
      posts: this.blogService.getPostsList(filters.category, filters.sortBy, filters.sortDirection),
      categories: this.blogService.getAllCategories(),
    }).pipe(
      map(({ posts, categories }) => ({ posts, categories, loading: false, error: null })),
      startWith(initialContentState),
      catchError((error: unknown) => of({
        posts: [], categories: [], loading: false,
        error: error instanceof Error ? error.message : 'Não foi possível carregar os posts.',
      })),
    )),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly viewModel = toSignal(
    combineLatest({ rawParams: this.rawQueryParams$, query: this.queryState$, content: this.contentState$ }).pipe(
      map(({ rawParams, query, content }): BlogListViewModel => {
        const totalItems = content.posts.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const normalizedQuery = content.loading
          ? query
          : normalizeBlogQueryState(query, totalPages, content.categories);
        if (!content.loading) {
          const normalizedParams = blogQueryParams(normalizedQuery);
          if (!queryIsCanonical(rawParams, normalizedParams)) {
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: normalizedParams,
              replaceUrl: true,
            });
          }
        }
        const startIndex = (normalizedQuery.page - 1) * this.itemsPerPage;
        return {
          ...normalizedQuery,
          ...content,
          totalItems,
          totalPages,
          displayedPosts: content.posts.slice(startIndex, startIndex + this.itemsPerPage),
        };
      }),
    ),
    {
      initialValue: {
        ...initialQueryState,
        ...initialContentState,
        displayedPosts: [], totalItems: 0, totalPages: 0,
      } as BlogListViewModel,
    },
  );

  get allPosts(): BlogPost[] { return this.viewModel().posts; }
  get displayedPosts(): BlogPost[] { return this.viewModel().displayedPosts; }
  get allCategories(): string[] { return this.viewModel().categories; }
  get loading(): boolean { return this.viewModel().loading; }
  get error(): string | null { return this.viewModel().error; }
  get currentPage(): number { return this.viewModel().page; }
  get totalItems(): number { return this.viewModel().totalItems; }
  get totalPages(): number { return this.viewModel().totalPages; }
  get selectedCategory(): string { return this.viewModel().category; }
  get sortBy(): BlogSortBy { return this.viewModel().sortBy; }
  get sortDirection(): BlogSortDirection { return this.viewModel().sortDirection; }

  ngOnInit(): void {
    if (this.router.url.includes('/blog')) {
      this.seoService.updateMetaTags({
        title: 'Blog | Psicóloga Natalia Ferreira',
        description: 'Artigos sobre saúde mental, relacionamentos, carreira e desenvolvimento pessoal por Natalia Ferreira, Psicóloga Clínica.',
        keywords: 'blog psicologia, artigos saúde mental, psicóloga blog, carreira, mulheres negras, bem-estar',
        url: `${SITE_URL}/blog`,
      });
    }
  }
  onPageChange(page: number): void {
    if (page < 1 || (this.totalPages > 0 && page > this.totalPages)) return;
    this.navigate({ page });
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('blog-list-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  onCategoryChange(category: string): void { this.navigate({ category, page: 1 }); }
  onSortChange(sortBy: string): void { this.navigate({ sortBy: sortBy === 'title' ? 'title' : 'date', page: 1 }); }
  onSortDirectionToggle(): void {
    this.navigate({ sortDirection: this.sortDirection === 'desc' ? 'asc' : 'desc', page: 1 });
  }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, index) => index + 1); }

  private navigate(changes: Partial<BlogQueryState>): void {
    const current = this.viewModel();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: blogQueryParams({
        page: current.page,
        category: current.category,
        sortBy: current.sortBy,
        sortDirection: current.sortDirection,
        ...changes,
      }),
      replaceUrl: true,
    });
  }
}
