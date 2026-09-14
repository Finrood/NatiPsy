import { isPlatformBrowser } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';
import { TopMenuComponent } from './components/top-menu/top-menu.component';
import { WHATSAPP_LINK } from './config/contact';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopMenuComponent, FooterComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'NatiPsy';
  readonly whatsappLink = WHATSAPP_LINK;

  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroy$ = new Subject<void>();
  private routeObserver: MutationObserver | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let initialNavigation = !this.router.navigated;
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(event => {
        if (initialNavigation) {
          initialNavigation = false;
          return;
        }

        // Fragment navigation already has a native scroll target. Do not
        // replace it with generic page focus.
        if (event.urlAfterRedirects.includes('#')) {
          return;
        }

        this.focusRouteDestination();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.routeObserver?.disconnect();
  }

  private focusRouteDestination(): void {
    this.routeObserver?.disconnect();
    const main = document.getElementById('main-content');
    if (!main) return;

    const focusReadyDestination = () => {
      const heading = main.querySelector<HTMLElement>('h1');
      const loading = main.querySelector('[aria-busy="true"]');
      if (!heading && loading) return;

      this.routeObserver?.disconnect();
      const destination = heading ?? main;
      if (!destination.hasAttribute('tabindex')) destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });

      const announcement = document.getElementById('route-announcer');
      if (announcement) {
        const label = heading?.textContent?.trim() || 'Conteúdo principal';
        announcement.textContent = `Navegação concluída: ${label}`;
      }
    };

    this.routeObserver = new MutationObserver(focusReadyDestination);
    this.routeObserver.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-busy'] });
    focusReadyDestination();
  }
}
