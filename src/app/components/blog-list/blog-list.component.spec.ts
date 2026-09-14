import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BlogListComponent } from './blog-list.component';

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

  it('uses automatic pagination scrolling when reduced motion is requested', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (() => ({ matches: true })) as unknown as typeof window.matchMedia;

    expect(component.getPaginationScrollBehavior()).toBe('auto');

    window.matchMedia = originalMatchMedia;
  });

  it('uses smooth pagination scrolling when reduced motion is not requested', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (() => ({ matches: false })) as unknown as typeof window.matchMedia;

    expect(component.getPaginationScrollBehavior()).toBe('smooth');

    window.matchMedia = originalMatchMedia;
  });
});
