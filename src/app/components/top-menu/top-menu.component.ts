import { isPlatformBrowser, NgClass } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  NgZone,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TopMenuComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  /** Element to restore keyboard focus to when the dialog closes. */
  private lastFocusedElement: HTMLElement | null = null;

  isMenuOpen = false;
  isScrolled = false;
  isHidden = false;
  lastScrollPosition = 0;

  readonly menuItems = ['inicio', 'meus-servicos', 'abordagem', 'vantagens', 'sobre-mim', 'blog'] as const;
  readonly menuDisplayNames: Record<string, string> = {
    'inicio': 'Início',
    'meus-servicos': 'Meus Serviços',
    'abordagem': 'Abordagem',
    'vantagens': 'Terapia Online',
    'sobre-mim': 'Sobre Mim',
    'blog': 'Blog',
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        window.addEventListener('scroll', this.handleScroll, { passive: true });
      });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.handleScroll);
    }
  }

  toggleMenu(): void {
    const opening = !this.isMenuOpen;
    this.isMenuOpen = opening;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = opening ? 'hidden' : '';
      if (opening && this.isHidden) {
        this.isHidden = false;
      }
    }
    this.cdr.markForCheck();
    if (opening) {
      this.focusMobileMenu();
    } else {
      this.restoreFocus();
    }
  }

  closeMenu(): void {
    if (!this.isMenuOpen) {
      return;
    }
    this.isMenuOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    this.cdr.markForCheck();
    this.restoreFocus();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).id === 'mobile-menu') {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  /**
   * Dialog focus management: move focus inside the opened dialog (first nav
   * link) and return it to whatever element invoked the dialog afterwards,
   * per WAI-ARIA modal-dialog practices.
   */
  private focusMobileMenu(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.lastFocusedElement = document.activeElement as HTMLElement | null;
    window.setTimeout(() => {
      document.querySelector<HTMLElement>('#mobile-menu a[href]')?.focus();
    });
  }

  private restoreFocus(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    window.setTimeout(() => {
      this.lastFocusedElement?.focus();
      this.lastFocusedElement = null;
    });
  }

  refreshPage(event: Event): void {
    event.preventDefault();
    if (isPlatformBrowser(this.platformId)) {
      const currentUrl = this.router.url;
      const isAtRoot = currentUrl === '/' || currentUrl.startsWith('/#');

      if (isAtRoot && !currentUrl.includes('#')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        this.router.navigate(['/']);
      }
    }
    this.closeMenu();
  }

  handleScroll = (): void => {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const scrolled = currentScrollPosition > 50;
    const hidden = currentScrollPosition > 100 && currentScrollPosition > this.lastScrollPosition;

    if (scrolled !== this.isScrolled || hidden !== this.isHidden) {
      this.ngZone.run(() => {
        this.isScrolled = scrolled;
        this.isHidden = hidden && !this.isMenuOpen;
        this.cdr.markForCheck();
      });
    }

    this.lastScrollPosition = currentScrollPosition <= 0 ? 0 : currentScrollPosition;
  };
}
