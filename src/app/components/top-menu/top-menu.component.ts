import { isPlatformBrowser, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

  readonly menuItems = ['inicio', 'meus-servicos', 'abordagem', 'vantagens', 'sobre-mim'];
  readonly menuDisplayNames: MenuDisplayName = {
    'inicio': 'início',
    'meus-servicos': 'meus serviços',
    'abordagem': 'abordagem',
    'vantagens': 'terapia online',
    'sobre-mim': 'sobre mim'
  };

  constructor(
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        window.addEventListener('scroll', this.handleScroll.bind(this));
      });

      setTimeout(() => {
        if (window.location.hash) {
          const sectionId = window.location.hash.slice(1);
          this.scrollToSection(sectionId);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  refreshPage(event: Event): void {
    event.preventDefault();
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({top: 0, behavior: "smooth"});
      history.pushState({}, '', '/');
    }
  }

  scrollToSection(sectionId: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      history.pushState({}, '', `#${sectionId}`);
      element.focus({preventScroll: true});
    } else if (sectionId === 'inicio') {
      window.scrollTo({top: 0, behavior: "smooth"});
      history.pushState({}, '', '/');
    }
    this.closeMenu();
  }

  handleScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollPosition < 0) {
      return;
    }

    // Run change detection inside the Angular zone
    this.ngZone.run(() => {
      this.isScrolled = currentScrollPosition > 50;
      this.isHidden = currentScrollPosition > 100 && currentScrollPosition > this.lastScrollPosition;
      this.lastScrollPosition = currentScrollPosition;
    });
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
