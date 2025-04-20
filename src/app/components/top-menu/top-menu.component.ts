import { isPlatformBrowser, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject } from 'rxjs';

interface MenuDisplayName {
  [key: string]: string;
}

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css'],
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIf
  ],
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
  isMenuOpen = false;
  isScrolled = false;
  isHidden = false;
  lastScrollPosition = 0;
  private destroy$ = new Subject<void>();

  readonly menuItems = ['inicio', 'meus-servicos', 'abordagem', 'vantagens', 'sobre-mim', 'blog'];
  readonly menuDisplayNames: MenuDisplayName = {
    'inicio': 'Início',
    'meus-servicos': 'Meus Serviços',
    'abordagem': 'Abordagem',
    'vantagens': 'Terapia Online',
    'sobre-mim': 'Sobre Mim',
    'blog': 'Blog',
  };

  constructor(
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
      if (this.isMenuOpen && this.isHidden) {
        this.isHidden = false;
      }
    }
  }

  closeMenu(): void {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = '';
      }
    }
  }

  refreshPage(event: Event): void {
    event.preventDefault();
    if (isPlatformBrowser(this.platformId)) {
      const currentUrl = this.router.url;
      const isAtRoot = currentUrl === '/' || currentUrl.startsWith('/#');

      if (isAtRoot && !currentUrl.includes('#')) {
        window.scrollTo({ top: 0, behavior: "smooth" });
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
      });
    }

    this.lastScrollPosition = currentScrollPosition <= 0 ? 0 : currentScrollPosition;
  }

  capitalizeFirstLetter(string: string): string {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
