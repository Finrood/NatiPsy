import { Component, OnInit, OnDestroy } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../../models/blog-post.model';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

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
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit, OnDestroy {
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

  private destroy$ = new Subject<void>();

  constructor(
    private blogService: BlogService,
    private seoService: SeoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.router.url === '/blog') {
      this.seoService.updateMetaTags({
        title: 'Blog | Psicóloga Natalia Ferreira',
        description: 'Artigos sobre saúde mental, relacionamentos, carreira e desenvolvimento pessoal por Natalia Ferreira, Psicóloga Clínica.',
        keywords: 'blog psicologia, artigos saúde mental, psicóloga blog, carreira, mulheres negras, bem-estar',
        url: 'https://psicologanataliaferreira.com/blog'
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
    this.blogService.getPostsList(this.selectedCategory, this.sortBy, this.sortDirection)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (posts) => {
          this.allPosts = posts;
          this.totalItems = this.allPosts.length;
          this.updateDisplayedPosts();
          if (this.allPosts.length === 0 && !this.loading) {
            this.error = "Nenhum post encontrado com os filtros selecionados.";
          }
        },
        error: (err) => {
          console.error('Error fetching blog posts:', err);
          this.error = err.message || 'Não foi possível carregar os posts. Tente novamente mais tarde.';
          this.allPosts = [];
          this.displayedPosts = [];
          this.totalItems = 0;
        }
      });
  }

  loadCategories(): void {
    this.blogService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.allCategories = categories;
        },
        error: (err) => {
          console.error('Error fetching categories:', err);
          // Handle category loading error if needed, maybe show a message
        }
      });
  }

  updateDisplayedPosts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPosts = this.allPosts.slice(startIndex, endIndex);
  }

  // --- Event Handlers ---

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateQueryParams();
    // No need to refetch all data, just update displayed slice
    this.updateDisplayedPosts();
    // Scroll to top of list smoothly
    const element = document.getElementById('blog-list-start');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page on filter change
    this.updateQueryParams();
    this.loadInitialData(); // Refetch data with new filter
  }

  onSortChange(): void {
    this.currentPage = 1; // Reset to first page on sort change
    this.updateQueryParams();
    this.loadInitialData(); // Refetch data with new sort order
  }

  updateQueryParams(): void {
    const queryParams: any = {
      page: this.currentPage > 1 ? this.currentPage : null,
      category: this.selectedCategory || null,
      sortBy: this.sortBy !== 'date' ? this.sortBy : null,
      sortDir: this.sortDirection !== 'desc' ? this.sortDirection : null
    };
    // Remove null values
    Object.keys(queryParams).forEach(key => queryParams[key] == null && delete queryParams[key]);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge', // Keep other query params if needed
      replaceUrl: true // Avoid polluting browser history excessively
    });
  }

  // --- Template Helpers ---

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pagesArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }
}
