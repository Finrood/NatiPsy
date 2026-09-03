import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, PLATFORM_ID } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { BlogPost, blogImageUrl } from '../../models/blog-post.model';
import { CommonModule, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { SITE_URL } from '../../config/contact';

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

  protected readonly imageUrl = blogImageUrl;

  ngOnInit(): void {
    if (this.router.url.includes('/blog')) {
      this.seoService.updateMetaTags({
        title: 'Blog | Psicóloga Natalia Ferreira',
        description: 'Artigos sobre saúde mental, relacionamentos, carreira e desenvolvimento pessoal por Natalia Ferreira, Psicóloga Clínica.',
        keywords: 'blog psicologia, artigos saúde mental, psicóloga blog, carreira, mulheres negras, bem-estar',
        url: `${SITE_URL}/blog/`
      });
    }

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.currentPage = params['page'] ? +params['page'] : 1;
        this.selectedCategory = params['category'] || '';
        this.sortBy = params['sortBy'] || 'date';
        this.sortDirection = params['sortDir'] || 'desc';
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
    const queryParams: Record<string, string | number | null> = {
      page: this.currentPage > 1 ? this.currentPage : null,
      category: this.selectedCategory || null,
      sortBy: this.sortBy !== 'date' ? this.sortBy : null,
      sortDir: this.sortDirection !== 'desc' ? this.sortDirection : null
    };

    Object.keys(queryParams).forEach(key => queryParams[key] == null && delete queryParams[key]);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
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
