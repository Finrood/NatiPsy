import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BlogPreviewComponent } from './blog-preview.component';

describe('BlogPreviewComponent', () => {
  let fixture: ComponentFixture<BlogPreviewComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPreviewComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogPreviewComponent);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('shows at most the three newest posts and links to the archive', () => {
    httpMock.expectOne('/assets/content/blog/index.json').flush([
      {
        slug: 'one',
        title: 'One',
        date: new Date('2025-03-01').toISOString(),
        description: 'd',
        image: null,
        categories: [],
        author: null,
      },
      {
        slug: 'two',
        title: 'Two',
        date: new Date('2025-02-01').toISOString(),
        description: 'd',
        image: null,
        categories: [],
        author: null,
      },
      {
        slug: 'three',
        title: 'Three',
        date: new Date('2025-01-01').toISOString(),
        description: 'd',
        image: null,
        categories: [],
        author: null,
      },
      {
        slug: 'four',
        title: 'Four',
        date: new Date('2024-01-01').toISOString(),
        description: 'd',
        image: null,
        categories: [],
        author: null,
      },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('app-blog-card')).toHaveLength(3);
    expect(
      fixture.nativeElement.querySelector('a[routerlink="/blog"], a[href="/blog"]'),
    ).toBeTruthy();
  });
});
