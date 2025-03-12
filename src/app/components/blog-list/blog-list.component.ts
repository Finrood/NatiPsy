import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../../models/blog-post.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.css'
})
export class BlogListComponent implements OnInit {
  posts: BlogPost[] = [];
  loading = true;
  error = false;

  constructor(
    private blogService: BlogService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Blog | Psicóloga Natalia Ferreira',
      description: 'Artigos sobre saúde mental, relacionamentos e desenvolvimento pessoal por Natalia Ferreira, Psicóloga Clínica.',
      keywords: 'blog psicologia, artigos saúde mental, psicóloga blog',
      url: 'https://psicologanataliaferreira.com/blog'
    });

    this.blogService.getPostsList().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching blog posts:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}