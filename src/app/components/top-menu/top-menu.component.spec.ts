import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TopMenuComponent } from './top-menu.component';

describe('TopMenuComponent', () => {
  let component: TopMenuComponent;
  let fixture: ComponentFixture<TopMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopMenuComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle menu state through signals', () => {
    expect(component.isMenuOpen()).toBe(false);

    component.toggleMenu();
    expect(component.isMenuOpen()).toBe(true);

    component.closeMenu();
    expect(component.isMenuOpen()).toBe(false);
  });

  it('renders exactly one deterministic header background for each menu state', () => {
    const header = fixture.nativeElement.querySelector('header') as HTMLElement;

    expect(header.classList.contains('bg-white/95')).toBe(true);
    expect(header.classList.contains('bg-primary-pink-dark/90')).toBe(false);
    expect(header.classList.contains('backdrop-blur-md')).toBe(true);

    component.toggleMenu();
    fixture.detectChanges();

    expect(header.classList.contains('bg-white/95')).toBe(false);
    expect(header.classList.contains('bg-primary-pink-dark/90')).toBe(true);
  });

  it('should wrap tab focus within the open mobile menu', () => {
    component.toggleMenu();
    fixture.detectChanges();

    const links = Array.from(document.querySelectorAll<HTMLElement>('#mobile-menu a[href]'));
    expect(links.length).toBeGreaterThan(0);
    const first = links[0];
    const last = links[links.length - 1];

    last.focus();
    component.onMenuKeyDown(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(document.activeElement).toBe(first);

    first.focus();
    component.onMenuKeyDown(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
    expect(document.activeElement).toBe(last);
  });
});
