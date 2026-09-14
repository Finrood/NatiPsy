import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlogPost } from '../../models/blog-post.model';
import { BlogService } from '../../services/blog.service';
import { BlogCardComponent } from '../blog-card/blog-card.component';

@Component({
  selector: 'app-blog-preview',
  standalone: true,
  imports: [CommonModule, RouterLink, BlogCardComponent],
  template: `
    <section class="py-16 bg-gradient-to-b from-gray-50 to-primary-pink/10" aria-labelledby="blog-preview-title">
      <div class="container mx-auto px-4">
        <h2 id="blog-preview-title" class="text-3xl md:text-4xl font-bold mb-4 text-center text-primary-blue">Do blog</h2>
        <p class="text-center text-lg text-gray-600 mb-10 max-w-2xl mx-auto">Reflexões sobre saúde mental, bem-estar, relacionamentos, carreira e desenvolvimento pessoal.</p>
        @if (loading) {
          <div class="text-center py-8" role="status" aria-live="polite" aria-busy="true"><p class="text-lg text-gray-600">Carregando artigos...</p></div>
        } @else if (error) {
          <p class="text-center text-red-700" role="alert">{{ error }}</p>
        } @else if (posts.length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @for (post of posts; track post.slug) { <app-blog-card [post]="post" headingLevel="h3"></app-blog-card> }
          </div>
        } @else {
          <p class="text-center text-gray-600">Novos artigos em breve.</p>
        }
        <div class="mt-10 text-center">
          <a routerLink="/blog" class="inline-flex items-center rounded-md bg-primary-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-blue/90 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2">Ver todos os artigos <span class="ml-2" aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPreviewComponent implements OnInit, OnDestroy {
  private readonly blogService = inject(BlogService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  posts: BlogPost[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.blogService.getPostsList().pipe(takeUntil(this.destroy$)).subscribe({
      next: posts => { this.posts = posts.slice(0, 3); this.loading = false; this.cdr.markForCheck(); },
      error: error => { this.error = error.message || 'Não foi possível carregar os artigos.'; this.loading = false; this.cdr.markForCheck(); },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
