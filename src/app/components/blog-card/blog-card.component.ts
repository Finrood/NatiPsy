import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogPost, blogDateOnly, blogImageUrl, formatBlogDate } from '../../models/blog-post.model';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  template: `
    <article class="group bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 motion-safe:hover:scale-[1.03] flex flex-col">
      <a [routerLink]="['/blog', post.slug]" class="block h-48 bg-gray-200 overflow-hidden">
        @if (post.image) {
          <img [ngSrc]="imageUrl(post.image)" [alt]="post.title"
            class="w-full h-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
            loading="lazy" width="400" height="200"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw">
        } @else {
          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-pink/20 to-primary-blue/10" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" fill="none" stroke="currentColor" stroke-width="1" />
            </svg>
          </div>
        }
      </a>
      <div class="p-6 flex flex-col flex-grow">
        <div class="flex items-center text-sm text-gray-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" />
          </svg>
          <time [attr.datetime]="dateOnly(post)">{{ formatDate(dateOnly(post)) }}</time>
        </div>
        @if (headingLevel === 'h2') {
          <h2 class="text-xl font-semibold mt-1 mb-3 text-primary-blue hover:text-primary-pink-dark transition-colors">
            <a [routerLink]="['/blog', post.slug]" class="line-clamp-2">{{ post.title }}</a>
          </h2>
        } @else {
          <h3 class="text-xl font-semibold mt-1 mb-3 text-primary-blue hover:text-primary-pink-dark transition-colors">
            <a [routerLink]="['/blog', post.slug]" class="line-clamp-2">{{ post.title }}</a>
          </h3>
        }
        <p class="mt-1 text-gray-600 line-clamp-3 flex-grow">{{ post.description }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          @for (category of post.categories; track category) {
            <span class="text-xs px-2 py-1 bg-primary-pink/80 text-primary-blue font-medium rounded-full">{{ category }}</span>
          }
        </div>
        <a [routerLink]="['/blog', post.slug]" class="mt-5 inline-block text-primary-blue font-semibold hover:text-primary-pink-dark transition-colors group/link self-start">
          Leia mais <span class="inline-block transition-transform group-hover/link:translate-x-1 ml-1" aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  `,
})
export class BlogCardComponent {
  @Input({ required: true }) post!: BlogPost;
  @Input() headingLevel: 'h2' | 'h3' = 'h3';

  protected readonly imageUrl = blogImageUrl;
  protected readonly dateOnly = blogDateOnly;
  protected readonly formatDate = formatBlogDate;
}
