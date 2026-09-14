import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { BlogPost, blogImageUrl } from '../../models/blog-post.model';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { SITE_URL } from '../../config/contact';

export function parseBlogPage(value: string | null | undefined): number | null {
  if (value == null) return null;
  return /^[1-9]\d*$/.test(value) ? Number(value) : -1;
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
  sortBy: keyof Pick<BlogPost, 'date' | 'title'> = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  private readonly destroy$ = new Subject<void>();
  private rawPageSegment: string | null = null;
  private invalidPage = false;

  protected readonly imageUrl = blogImageUrl;
  protected readonly dateOnly = blogDateOnly;
  protected readonly formatDate = formatBlogDate;

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParams])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([routeParams, params]) => {
        this.rawPageSegment = routeParams.get('page');
        const pathPage = parseBlogPage(this.rawPageSegment);
        const queryValue = Array.isArray(params['page']) ? params['page'][0] : params['page'];
        const queryPage = parseBlogPage(queryValue);
        this.invalidPage = pathPage === -1 || (pathPage === null && queryPage === -1);
        if (pathPage === null && queryPage !== null && queryPage !== -1) {
          this.router.navigate(queryPage > 1 ? ['/blog/page', queryPage] : ['/blog'], {
            queryParams: { ...params, page: null },
            replaceUrl: true,
          });
        }
        this.currentPage = pathPage && pathPage > 0 ? pathPage : queryPage && queryPage > 0 ? queryPage : 1;
        this.selectedCategory = params['category'] || '';
        this.sortBy = params['sortBy'] || 'date';
        this.sortDirection = params['sortDir'] || 'desc';
        this.loadInitialData();
        this.updateSeo();
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
          if (this.invalidPage || (this.totalPages > 0 && this.currentPage > this.totalPages)) {
            this.error = 'Esta página do blog não foi encontrada.';
            this.displayedPosts = [];
            this.updateSeo();
            this.cdr.markForCheck();
            return;
          }
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

  onFilterChange(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }

  updateQueryParams(): void {
    const queryParams: Record<string, string | number | null> = {
      category: this.selectedCategory || null,
      sortBy: this.sortBy !== 'date' ? this.sortBy : null,
      sortDir: this.sortDirection !== 'desc' ? this.sortDirection : null
    };

    Object.keys(queryParams).forEach(key => queryParams[key] == null && delete queryParams[key]);

    this.router.navigate([this.pageUrl(this.currentPage)], {
      queryParams: queryParams,
      replaceUrl: true
    });
  }

  private updateSeo(): void {
    const hasAlternateView = Boolean(this.invalidPage || this.selectedCategory || this.sortBy !== 'date' || this.sortDirection !== 'desc');
    const canonicalPath = this.rawPageSegment ? `/blog/page/${this.rawPageSegment}` : this.pageUrl(this.currentPage);
    this.seoService.updateMetaTags({
      title: this.currentPage === 1 ? 'Blog | Psicóloga Natalia Ferreira' : `Blog — Página ${this.currentPage} | Psicóloga Natalia Ferreira`,
      description: 'Artigos sobre saúde mental, relacionamentos, carreira e desenvolvimento pessoal por Natalia Ferreira, Psicóloga Clínica.',
      keywords: 'blog psicologia, artigos saúde mental, psicóloga blog, carreira, mulheres negras, bem-estar',
      url: `${SITE_URL}${canonicalPath}`,
      robots: hasAlternateView ? 'noindex,follow' : undefined,
    });
  }

  // --- Template Helpers ---

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pageWindow = 5;
    const halfWindow = Math.floor(pageWindow / 2);
    let start = Math.max(1, this.currentPage - halfWindow);
    const end = Math.min(this.totalPages, start + pageWindow - 1);
    start = Math.max(1, end - pageWindow + 1);
    const pagesArray: number[] = [];
    for (let i = start; i <= end; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
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
}
