import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReplaySubject, of, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { BlogListComponent } from './blog-list.component';
import { BlogService } from '../../services/blog.service';

describe('BlogListComponent', () => {
  let component: BlogListComponent;
  let fixture: ComponentFixture<BlogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('BlogListComponent reactive state', () => {
  it('does not let a delayed older filter overwrite a newer selection', fakeAsync(() => {
    const queryParams$ = new ReplaySubject<Params>(1);
    queryParams$.next({ category: 'older' });
    const postsFor = (category: string) => category === 'older'
      ? timer(50).pipe(map(() => [{ slug: 'older', title: 'Older', date: new Date(), description: 'd', image: null, categories: ['older'], content: '', readTime: 1 }]))
      : of([{ slug: 'newer', title: 'Newer', date: new Date(), description: 'd', image: null, categories: ['newer'], content: '', readTime: 1 }]);

    TestBed.configureTestingModule({
      imports: [BlogListComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParams: queryParams$.asObservable() } },
        { provide: BlogService, useValue: { getPostsList: postsFor, getAllCategories: () => of(['older', 'newer']) } },
      ],
    });

    const fixture = TestBed.createComponent(BlogListComponent);
    fixture.detectChanges();
    queryParams$.next({ category: 'newer' });
    tick();

    expect(fixture.componentInstance.displayedPosts[0]?.slug).toBe('newer');
    tick(50);
    expect(fixture.componentInstance.displayedPosts[0]?.slug).toBe('newer');
  }));
});
