import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BlogCardComponent } from './blog-card.component';

describe('BlogCardComponent', () => {
  let fixture: ComponentFixture<BlogCardComponent>;

  const post = {
    slug: 'example',
    title: 'Example title',
    date: new Date('2025-01-01'),
    description: 'Description',
    image: null,
    categories: [],
    tags: [],
    categoryDetails: [{ slug: 'carreira', label: 'Carreira', description: 'Vida profissional' }],
    content: '',
    readTime: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('uses h3 by default for cards below the homepage preview heading', () => {
    fixture = TestBed.createComponent(BlogCardComponent);
    fixture.componentInstance.post = post;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h3')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('h2')).toBeNull();
  });

  it('supports h2 cards in the archive', () => {
    fixture = TestBed.createComponent(BlogCardComponent);
    fixture.componentInstance.post = post;
    fixture.componentInstance.headingLevel = 'h2';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h2')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('h3')).toBeNull();
  });

  it('links registered categories from the shared card', () => {
    fixture = TestBed.createComponent(BlogCardComponent);
    fixture.componentInstance.post = post;
    fixture.detectChanges();

    const category = fixture.nativeElement.querySelector('a[href="/blog/categoria/carreira"]');
    expect(category?.textContent.trim()).toBe('Carreira');
  });
});
