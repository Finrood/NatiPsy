import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BlogListComponent, blogQueryParams, parseBlogQueryParams } from './blog-list.component';

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

  it('normalizes invalid query enums and page values to safe defaults', () => {
    expect(parseBlogQueryParams({
      page: '0',
      sortBy: 'invalid',
      sortDir: 'sideways',
      category: ['Carreira'],
    })).toEqual({
      page: 1,
      category: 'Carreira',
      sortBy: 'date',
      sortDirection: 'desc',
    });

    expect(parseBlogQueryParams({ page: '-4' }).page).toBe(1);
    expect(parseBlogQueryParams({ page: 'not-a-number' }).page).toBe(1);
    expect(parseBlogQueryParams({ page: '999999999999999999999' }).page).toBe(1);
  });

  it('serializes default state with nulls so stale query keys are removed', () => {
    expect(blogQueryParams({
      page: 1,
      category: '',
      sortBy: 'date',
      sortDirection: 'desc',
    })).toEqual({ page: null, category: null, sortBy: null, sortDir: null });
  });
});
