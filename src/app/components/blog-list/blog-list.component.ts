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
import { combineLatest, forkJoin, of, Subject } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import {
  BLOG_ERROR_MESSAGES,
  BlogService,
  BlogServiceError,
} from '../../services/blog.service';
import {
  BlogPost,
  blogDateOnly,
  blogImageUrl,
  formatBlogDate,
} from '../../models/blog-post.model';
import { SeoService } from '../../services/seo.service';
import { PERSON_NAME, SITE_URL } from '../../config/contact';

export type BlogSortBy = keyof Pick<BlogPost, 'date' | 'title'>;
export type BlogSortDirection = 'asc' | 'desc';

export interface BlogQueryState {
  page: number;
  category: string;
  sortBy: BlogSortBy;
  sortDirection: BlogSortDirection;
}

export function paginateItems<T>(
  items: T[],
  page: number,
  itemsPerPage: number,
): T[] {
  const start = (Math.max(1, page) - 1) * itemsPerPage;
  return items.slice(start, start + itemsPerPage);
}

export function paginationWindow(
  totalPages: number,
  currentPage: number,
  pageWindow = 5,
): number[] {
  const halfWindow = Math.floor(pageWindow / 2);
  let start = Math.max(1, currentPage - halfWindow);
  const end = Math.min(totalPages, start + pageWindow - 1);
  start = Math.max(1, end - pageWindow + 1);
  return Array.from(
    { length: Math.max(0, end - start + 1) },
    (_, index) => start + index,
  );
}

export function parseBlogPage(value: string | null | undefined): number | null {
  if (value == null) return null;
  const page = /^[1-9]\d*$/.test(value) ? Number(value) : NaN;
  return Number.isSafeInteger(page) ? page : -1;
}

interface BlogContentState {
  posts: BlogPost[];
  categories: string[];
  loading: boolean;
  error: string | null;
  categoryError: string | null;
  errorRetryable: boolean;
  categoryRetryable: boolean;
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
  categoryError: null,
  errorRetryable: false,
  categoryRetryable: false,
};

function errorMessage(error: unknown): string {
  if (error instanceof BlogServiceError) {
    return BLOG_ERROR_MESSAGES[error.kind];
  }
  return 'Não foi possível carregar este conteúdo.';
}

function canRetry(error: unknown): boolean {
  return !(error instanceof BlogServiceError && error.kind === 'not-found');
}

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
      typeof sortByValue === 'string' &&
      validSortFields.has(sortByValue as BlogSortBy)
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
    category:
      state.category && categories.includes(state.category)
        ? state.category
        : '',
  };
}

function sameQueryValue(
  rawValue: unknown,
  normalizedValue: string | number | null,
): boolean {
  const value = firstQueryValue(rawValue);
  if (normalizedValue === null) return value === undefined;
  return String(value) === String(normalizedValue);
}

function sameQuery(a: BlogQueryState, b: BlogQueryState): boolean {
  return (
    a.page === b.page &&
    a.category === b.category &&
    a.sortBy === b.sortBy &&
    a.sortDirection === b.sortDirection
  );
}

function queryIsCanonical(
  params: Params,
  serialized: Record<string, string | number | null>,
): boolean {
  const keys = new Set(Object.keys(serialized));
  return (
    Object.keys(params).every((key) => keys.has(key)) &&
    Object.entries(serialized).every(([key, value]) =>
      sameQueryValue(params[key], value),
    )
  );
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
  private readonly retry$ = new Subject<void>();
  retryingList = false;
  retryingCategories = false;

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
  private readonly rawRoutePage$ = (this.route.paramMap ?? of(null)).pipe(
    map((params) => params?.get('page') ?? null),
    startWith(this.route.snapshot?.paramMap?.get('page') ?? null),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  private readonly queryState$ = this.rawQueryParams$.pipe(
    map(parseBlogQueryParams),
    distinctUntilChanged(sameQuery),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  private readonly effectiveQueryState$ = combineLatest({
    query: this.queryState$,
    rawPage: this.rawRoutePage$,
  }).pipe(
    map(({ query, rawPage }) => {
      const routePage = parseBlogPage(rawPage);
      return routePage !== null && routePage > 0
        ? { ...query, page: routePage }
        : query;
    }),
    distinctUntilChanged(sameQuery),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  private readonly filterState$ = this.queryState$.pipe(
    map(({ category, sortBy, sortDirection }) => ({
      category,
      sortBy,
      sortDirection,
    })),
    distinctUntilChanged(
      (a, b) =>
        a.category === b.category &&
        a.sortBy === b.sortBy &&
        a.sortDirection === b.sortDirection,
    ),
  );
  private readonly contentState$ = this.filterState$.pipe(
    switchMap((filters) =>
      this.retry$.pipe(
        startWith(undefined),
        switchMap(() =>
          forkJoin({
            posts: this.blogService
              .getPostsList(
                filters.category,
                filters.sortBy,
                filters.sortDirection,
              )
              .pipe(
                map((posts) => ({ value: posts, error: null as string | null, retryable: false })),
                catchError((error: unknown) =>
                  of({ value: [] as BlogPost[], error: errorMessage(error), retryable: canRetry(error) }),
                ),
              ),
            categories: this.blogService.getAllCategories().pipe(
              map((categories) => ({ value: categories, error: null as string | null, retryable: false })),
              catchError((error: unknown) =>
                of({ value: [] as string[], error: errorMessage(error), retryable: canRetry(error) }),
              ),
            ),
          }).pipe(
            map(({ posts, categories }): BlogContentState => ({
              posts: posts.value,
              categories: categories.value,
              loading: false,
              error: posts.error,
              categoryError: categories.error,
              errorRetryable: posts.retryable,
              categoryRetryable: categories.retryable,
            })),
            startWith(initialContentState as BlogContentState),
          ),
        ),
      ),
    ),
    tap((state) => {
      if (!state.loading) {
        this.retryingList = false;
        this.retryingCategories = false;
      }
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly viewModel = toSignal(
    combineLatest({
      rawParams: this.rawQueryParams$,
      rawPage: this.rawRoutePage$,
      query: this.effectiveQueryState$,
      content: this.contentState$,
    }).pipe(
      map(({ rawParams, rawPage, query, content }): BlogListViewModel => {
        const rawQuery = parseBlogQueryParams(rawParams);
        const queryParamsSettled =
          rawQuery.category === query.category &&
          rawQuery.sortBy === query.sortBy &&
          rawQuery.sortDirection === query.sortDirection;
        const totalItems = content.posts.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const routePage = parseBlogPage(rawPage);
        const requestedPage =
          routePage !== null && routePage > 0 ? routePage : query.page;
        const invalidPage =
          routePage === -1 ||
          (!content.loading &&
            routePage !== null &&
            requestedPage > totalPages);
        const normalizedQuery =
          content.loading || invalidPage
            ? { ...query, page: requestedPage }
            : normalizeBlogQueryState(query, totalPages, content.categories);
        const pageError = invalidPage
          ? 'Esta página do blog não foi encontrada.'
          : null;
        const hasAlternateView = Boolean(
          pageError ||
          query.category ||
          query.sortBy !== 'date' ||
          query.sortDirection !== 'desc',
        );
        const serializedQuery = blogQueryParams({
          ...normalizedQuery,
          page: 1,
        });
        if (
          queryParamsSettled &&
          !content.loading &&
          rawPage === null &&
          query.page > 1
        ) {
          if (this.route.paramMap) {
            this.router.navigate(
              normalizedQuery.page > 1
                ? ['/blog/page', normalizedQuery.page]
                : ['/blog'],
              { queryParams: serializedQuery, replaceUrl: true },
            );
          } else {
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: blogQueryParams(normalizedQuery),
              replaceUrl: true,
            });
          }
        } else if (queryParamsSettled && !content.loading && !invalidPage) {
          const normalizedParams =
            rawPage !== null
              ? serializedQuery
              : blogQueryParams(normalizedQuery);
          if (!queryIsCanonical(rawParams, normalizedParams)) {
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: normalizedParams,
              replaceUrl: true,
            });
          }
        }
        if (this.router.url.split(/[?#]/)[0].startsWith('/blog')) {
          this.seoService.updateMetaTags({
            title:
              requestedPage === 1
                ? `Blog | Psicóloga ${PERSON_NAME}`
                : `Blog — Página ${requestedPage} | Psicóloga ${PERSON_NAME}`,
            description: `Artigos sobre saúde mental, relacionamentos, carreira e desenvolvimento pessoal por ${PERSON_NAME}, Psicóloga Clínica.`,
            keywords:
              'blog psicologia, artigos saúde mental, psicóloga blog, carreira, mulheres negras, bem-estar',
            url: `${SITE_URL}${requestedPage > 1 ? `/blog/page/${requestedPage}` : '/blog'}`,
            robots: hasAlternateView ? 'noindex,follow' : undefined,
          });
        }
        const visiblePosts = pageError
          ? []
          : paginateItems(
              content.posts,
              normalizedQuery.page,
              this.itemsPerPage,
            );
        return {
          ...normalizedQuery,
          ...content,
          error: pageError ?? content.error,
          errorRetryable: !pageError && content.errorRetryable,
          totalItems,
          totalPages,
          displayedPosts: visiblePosts,
        };
      }),
    ),
    {
      initialValue: {
        ...initialQueryState,
        ...initialContentState,
        displayedPosts: [],
        totalItems: 0,
        totalPages: 0,
      } as BlogListViewModel,
    },
  );

  get allPosts(): BlogPost[] {
    return this.viewModel().posts;
  }
  get displayedPosts(): BlogPost[] {
    return this.viewModel().displayedPosts;
  }
  get allCategories(): string[] {
    return this.viewModel().categories;
  }
  get loading(): boolean {
    return this.viewModel().loading;
  }
  get error(): string | null {
    return this.viewModel().error;
  }
  get categoryError(): string | null {
    return this.viewModel().categoryError;
  }
  get errorRetryable(): boolean {
    return this.viewModel().errorRetryable;
  }
  get categoryRetryable(): boolean {
    return this.viewModel().categoryRetryable;
  }
  get currentPage(): number {
    return this.viewModel().page;
  }
  get totalItems(): number {
    return this.viewModel().totalItems;
  }
  get totalPages(): number {
    return this.viewModel().totalPages;
  }
  get selectedCategory(): string {
    return this.viewModel().category;
  }
  get sortBy(): BlogSortBy {
    return this.viewModel().sortBy;
  }
  get sortDirection(): BlogSortDirection {
    return this.viewModel().sortDirection;
  }

  ngOnInit(): void {
    if (this.router.url.split(/[?#]/)[0].startsWith('/blog')) {
      this.seoService.updateMetaTags({
        title: `Blog | Psicóloga ${PERSON_NAME}`,
        description: `Artigos sobre saúde mental, relacionamentos, carreira e desenvolvimento pessoal por ${PERSON_NAME}, Psicóloga Clínica.`,
        keywords: 'blog psicologia, artigos saúde mental, psicóloga blog, carreira, mulheres negras, bem-estar',
        url: `${SITE_URL}/blog`,
      });
    }
  }
  onPageChange(page: number): void {
    if (page < 1 || (this.totalPages > 0 && page > this.totalPages)) return;
    this.navigate({ page });
    if (isPlatformBrowser(this.platformId)) {
      document
        .getElementById('blog-list-start')
        ?.scrollIntoView({
          behavior: this.getPaginationScrollBehavior(),
          block: 'start',
        });
    }
  }

  getPaginationScrollBehavior(): ScrollBehavior {
    if (
      !isPlatformBrowser(this.platformId) ||
      typeof window.matchMedia !== 'function'
    ) {
      return 'auto';
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
  }
  onCategoryChange(category: string): void {
    this.navigate({ category, page: 1 });
  }
  onSortChange(sortBy: string): void {
    this.navigate({ sortBy: sortBy === 'title' ? 'title' : 'date', page: 1 });
  }
  onSortDirectionToggle(): void {
    this.navigate({
      sortDirection: this.sortDirection === 'desc' ? 'asc' : 'desc',
      page: 1,
    });
  }
  get pages(): number[] {
    return paginationWindow(this.totalPages, this.currentPage);
  }

  pageUrl(page: number): string {
    return page === 1 ? '/blog' : `/blog/page/${page}`;
  }

  get paginationQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};
    if (this.selectedCategory) params['category'] = this.selectedCategory;
    if (this.sortBy !== 'date') params['sortBy'] = this.sortBy;
    if (this.sortDirection !== 'desc') params['sortDir'] = this.sortDirection;
    return params;
  }

  get previousPage(): number | null {
    return this.currentPage > 1 ? this.currentPage - 1 : null;
  }
  get nextPage(): number | null {
    return this.currentPage < this.totalPages ? this.currentPage + 1 : null;
  }

  retry(): void {
    if (!this.retryingList) {
      this.retryingList = true;
      this.retry$.next();
    }
  }

  retryCategories(): void {
    if (!this.retryingCategories) {
      this.retryingCategories = true;
      this.retry$.next();
    }
  }

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
