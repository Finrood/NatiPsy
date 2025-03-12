import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {BlogService} from '../../services/blog.service';
import {BlogPost} from '../../models/blog-post.model';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    RouterLink,
    DatePipe
  ],
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.css'
})
export class BlogPostComponent implements OnInit {
  post: BlogPost | null = null;
  loading = true;
  safeContent: SafeHtml | null = null;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loading = true;
        this.blogService.getPostBySlug(slug).subscribe({
          next: (post) => {
            this.post = post;
            if (post && post.content) {
              this.post!.content = this.sanitizer.bypassSecurityTrustHtml(post.content) as string;
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading blog post:', error);
            this.post = null;
            this.loading = false;
          }
        });
      }
    });
  }
}
