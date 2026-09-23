import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params, Router, provideRouter } from '@angular/router';
import { ReplaySubject, Observable, of, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  BlogListComponent,
  blogQueryParams,
  normalizeBlogQueryState,
  paginateItems,
  parseBlogQueryParams,
  paginationWindow,
  parseBlogPage,
} from './blog-list.component';
import { BlogService } from '../../services/blog.service';

const post = (slug: string) => ({
  slug,
  title: slug,
  date: new Date(),
  description: 'description',
  image: null,
  categories: [slug],
  content: '',
  readTime: 1,
});

async function createReactiveFixture(
  queryParams$: ReplaySubject<Params>,
  getPostsList: (category: string) => Observable<ReturnType<typeof post>[]>,
  getAllCategories = () => of(['older', 'newer']),
): Promise<ComponentFixture<BlogListComponent>> {
  await TestBed.configureTestingModule({
    imports: [BlogListComponent],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { queryParams: queryParams$.asObservable() },
      },
      { provide: BlogService, useValue: { getPostsList, getAllCategories } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(BlogListComponent);
  fixture.detectChanges();
  return fixture;
}

describe('BlogListComponent reactive state', () => {
  it('cancels stale filter work when a newer selection arrives', async () => {
    vi.useFakeTimers();
    try {
      const queryParams$ = new ReplaySubject<Params>(1);
      queryParams$.next({ category: 'older' });
      const postsFor = (category: string) =>
        category === 'older'
          ? timer(50).pipe(map(() => [post('older')]))
          : of([post('newer')]);
      const fixture = await createReactiveFixture(queryParams$, postsFor);
      queryParams$.next({ category: 'newer' });
      await vi.advanceTimersByTimeAsync(0);
      expect(fixture.componentInstance.displayedPosts[0]?.slug).toBe('newer');
      await vi.advanceTimersByTimeAsync(50);
      expect(fixture.componentInstance.displayedPosts[0]?.slug).toBe('newer');
      fixture.destroy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not refetch content for a page-only query change', async () => {
    const queryParams$ = new ReplaySubject<Params>(1);
    queryParams$.next({});
    let postsRequests = 0;
    let categoryRequests = 0;
    const fixture = await createReactiveFixture(
      queryParams$,
      () => {
        postsRequests += 1;
        return of(
          Array.from({ length: 7 }, (_, index) => post(`post-${index}`)),
        );
      },
      () => {
        categoryRequests += 1;
        return of(['older', 'newer']);
      },
    );
    queryParams$.next({ page: '2' });
    expect(fixture.componentInstance.currentPage).toBe(2);
    expect(postsRequests).toBe(1);
    expect(categoryRequests).toBe(1);
    fixture.destroy();
  });

  it('stops observing route changes after teardown', async () => {
    const queryParams$ = new ReplaySubject<Params>(1);
    queryParams$.next({});
    let postsRequests = 0;
    const fixture = await createReactiveFixture(queryParams$, () => {
      postsRequests += 1;
      return of([post('initial')]);
    });
    fixture.destroy();
    queryParams$.next({ category: 'newer' });
    expect(postsRequests).toBe(1);
  });

  it('rewrites invalid and excessive query state with replaceUrl', async () => {
    const queryParams$ = new ReplaySubject<Params>(1);
    queryParams$.next({
      page: '999',
      sortBy: 'invalid',
      sortDir: 'sideways',
      extra: 'stale',
    });
    const fixture = await createReactiveFixture(queryParams$, () =>
      of([post('one')]),
    );
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    queryParams$.next({
      page: '999',
      sortBy: 'invalid',
      sortDir: 'sideways',
      extra: 'stale',
    });
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: {
          page: null,
          category: null,
          sortBy: null,
          sortDir: null,
        },
        replaceUrl: true,
      }),
    );
    fixture.destroy();
  });

  it('does not prioritize homepage preview images', async () => {
    const queryParams$ = new ReplaySubject<Params>(1);
    queryParams$.next({});
    const fixture = await createReactiveFixture(queryParams$, () => of([post('one')]));
    fixture.componentInstance.firstImagePriority = false;
    expect(fixture.componentInstance.shouldPrioritizeFirstImage).toBe(false);
    fixture.destroy();
  });

  it('prioritizes the first image when explicitly enabled', async () => {
    const queryParams$ = new ReplaySubject<Params>(1);
    queryParams$.next({});
    const fixture = await createReactiveFixture(queryParams$, () => of([post('one')]));
    fixture.componentInstance.firstImagePriority = true;
    expect(fixture.componentInstance.shouldPrioritizeFirstImage).toBe(true);
    fixture.destroy();
  });

  it('uses automatic pagination scrolling when reduced motion is requested', async () => {
    const queryParams$ = new ReplaySubject<Params>(1);
    queryParams$.next({});
    const fixture = await createReactiveFixture(queryParams$, () => of([post('one')]));
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (() => ({ matches: true })) as unknown as typeof window.matchMedia;

    try {
      expect(fixture.componentInstance.getPaginationScrollBehavior()).toBe('auto');
    } finally {
      window.matchMedia = originalMatchMedia;
      fixture.destroy();
    }
  });

  it('uses smooth pagination scrolling when reduced motion is not requested', async () => {
    const queryParams$ = new ReplaySubject<Params>(1);
    queryParams$.next({});
    const fixture = await createReactiveFixture(queryParams$, () => of([post('one')]));
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (() => ({ matches: false })) as unknown as typeof window.matchMedia;

    try {
      expect(fixture.componentInstance.getPaginationScrollBehavior()).toBe('smooth');
    } finally {
      window.matchMedia = originalMatchMedia;
      fixture.destroy();
    }
  });

  it('normalizes invalid query enums and page values to safe defaults', () => {
    expect(
      parseBlogQueryParams({
        page: '0',
        sortBy: 'invalid',
        sortDir: 'sideways',
        category: ['Carreira'],
      }),
    ).toEqual({
      page: 1,
      category: 'Carreira',
      sortBy: 'date',
      sortDirection: 'desc',
    });
    expect(parseBlogQueryParams({ page: '-4' }).page).toBe(1);
    expect(parseBlogQueryParams({ page: 'not-a-number' }).page).toBe(1);
    expect(parseBlogQueryParams({ page: '999999999999999999999' }).page).toBe(
      1,
    );
  });

  it('clears invalid categories and bounds excessive pages', () => {
    expect(
      normalizeBlogQueryState(
        {
          page: 99,
          category: 'missing',
          sortBy: 'title',
          sortDirection: 'asc',
        },
        3,
        ['Carreira'],
      ),
    ).toEqual({
      page: 3,
      category: '',
      sortBy: 'title',
      sortDirection: 'asc',
    });
  });

  it('serializes default state with nulls so stale query keys are removed', () => {
    expect(
      blogQueryParams({
        page: 1,
        category: '',
        sortBy: 'date',
        sortDirection: 'desc',
      }),
    ).toEqual({
      page: null,
      category: null,
      sortBy: null,
      sortDir: null,
    });
  });
});
