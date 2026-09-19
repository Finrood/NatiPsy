import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, PLATFORM_ID, Input } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { BlogPost, blogDateOnly, blogImageUrl, formatBlogDate } from '../../models/blog-post.model';
import { CommonModule, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router, Params } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { SITE_URL } from '../../config/contact';

export type BlogSortBy = keyof Pick<BlogPost, 'date' | 'title'>;
export type BlogSortDirection = 'asc' | 'desc';

export interface BlogQueryState {
  page: number;
  category: string;
  sortBy: BlogSortBy;
  sortDirection: BlogSortDirection;
}

const validSortFields = new Set<BlogSortBy>(['date', 'title']);
const validSortDirections = new Set<BlogSortDirection>(['asc', 'desc']);

function firstQueryValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositivePage(value: unknown): number {
  const raw = firstQueryValue(value);
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) {
    return 1;
  }

  const page = Number(raw);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function parseBlogQueryParams(params: Params): BlogQueryState {
  const sortByValue = firstQueryValue(params['sortBy']);
  const sortDirectionValue = firstQueryValue(params['sortDir']);

  return {
    page: parsePositivePage(params['page']),
    category: typeof firstQueryValue(params['category']) === 'string'
      ? firstQueryValue(params['category']) as string
      : '',
    sortBy: typeof sortByValue === 'string' && validSortFields.has(sortByValue as BlogSortBy)
      ? sortByValue as BlogSortBy
      : 'date',
    sortDirection: typeof sortDirectionValue === 'string' && validSortDirections.has(sortDirectionValue as BlogSortDirection)
      ? sortDirectionValue as BlogSortDirection
      : 'desc',
  };
}

export function blogQueryParams(state: BlogQueryState): Record<string, string | number | null> {
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

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NgOptimizedImage,
  ],
  templateUrl: './blog-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent implements OnInit, OnDestroy {
  private readonly blogService = inject(BlogService);
  private readonly seoService = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  /** Whether the first card is an above-the-fold LCP candidate. Homepage
   * previews explicitly pass false; the standalone archive defaults to true. */
  @Input() firstImagePriority?: boolean;

  allPosts: BlogPost[] = [];
  displayedPosts: BlogPost[] = [];
  allCategories: string[] = [];

  loading = true;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;

  // Filtering & Sorting
  selectedCategory: string = '';
  sortBy: BlogSortBy = 'date';
  sortDirection: BlogSortDirection = 'desc';

  private readonly destroy$ = new Subject<void>();
  private rawQueryParams: Params = {};
  private postsLoaded = false;
  private categoriesLoaded = false;
  private canonicalizationPending = false;

  protected readonly imageUrl = blogImageUrl;
  protected readonly dateOnly = blogDateOnly;
  protected readonly formatDate = formatBlogDate;

  get shouldPrioritizeFirstImage(): boolean {
    return this.firstImagePriority ?? this.router.url.startsWith('/blog');
  }

  ngOnInit(): void {
    if (this.router.url.includes('/blog')) {
      this.seoService.updateMetaTags({
        title: 'Blog | Psicóloga Natalia Ferreira',
        description: 'Artigos sobre saúde mental, relacionamentos, carreira e desenvolvimento pessoal por Natalia Ferreira, Psicóloga Clínica.',
        keywords: 'blog psicologia, artigos saúde mental, psicóloga blog, carreira, mulheres negras, bem-estar',
        url: `${SITE_URL}/blog`
      });
    }

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.rawQueryParams = params;
        this.postsLoaded = false;
        this.canonicalizationPending = false;
        const state = parseBlogQueryParams(params);
        this.currentPage = state.page;
        this.selectedCategory = state.category;
        this.sortBy = state.sortBy;
        this.sortDirection = state.sortDirection;
        this.loadInitialData();
      });

    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialData(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.blogService.getPostsList(this.selectedCategory, this.sortBy, this.sortDirection)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (posts) => {
          this.allPosts = posts;
          this.totalItems = this.allPosts.length;
          this.postsLoaded = true;
          this.normalizeLoadedState();
          this.updateDisplayedPosts();
          if (this.allPosts.length === 0 && !this.loading) {
            this.error = 'Nenhum post encontrado com os filtros selecionados.';
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error fetching blog posts:', err);
          this.error = err.message || 'Não foi possível carregar os posts. Tente novamente mais tarde.';
          this.allPosts = [];
          this.displayedPosts = [];
          this.totalItems = 0;
          this.cdr.markForCheck();
        }
      });
  }

  loadCategories(): void {
    this.blogService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.allCategories = categories;
          this.categoriesLoaded = true;
          this.normalizeLoadedState();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error fetching categories:', err);
        }
      });
  }

  updateDisplayedPosts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPosts = this.allPosts.slice(startIndex, endIndex);
    this.cdr.markForCheck();
  }

  // --- Event Handlers ---

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateQueryParams();
    this.updateDisplayedPosts();
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById('blog-list-start');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: blogQueryParams({
        page: this.currentPage,
        category: this.selectedCategory,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection,
      }),
      replaceUrl: true
    });
  }

  private normalizeLoadedState(): void {
    if (!this.postsLoaded || !this.categoriesLoaded || this.canonicalizationPending) return;

    const normalizedState = normalizeBlogQueryState({
      page: this.currentPage,
      category: this.selectedCategory,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
    }, this.totalPages, this.allCategories);
    const normalizedParams = blogQueryParams(normalizedState);
    const canonicalKeys = new Set(Object.keys(normalizedParams));
    const queryIsCanonical = Object.keys(this.rawQueryParams).every((key) => canonicalKeys.has(key))
      && Object.entries(normalizedParams)
        .every(([key, value]) => sameQueryValue(this.rawQueryParams[key], value));

    if (!queryIsCanonical) {
      this.currentPage = normalizedState.page;
      this.selectedCategory = normalizedState.category;
      this.canonicalizationPending = true;
      this.updateQueryParams();
    }
  }

  // --- Template Helpers ---

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pagesArray: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }
}
