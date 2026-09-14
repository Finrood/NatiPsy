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
