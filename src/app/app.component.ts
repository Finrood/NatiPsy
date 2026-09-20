import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';
import { TopMenuComponent } from './components/top-menu/top-menu.component';
import { PERSON_NAME, WHATSAPP_LINK } from './config/contact';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopMenuComponent, FooterComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  title = PERSON_NAME;
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
    let focusUserNavigation = false;
    let previousHeading: HTMLElement | null = null;
    let previousHeadingText = '';
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationStart) {
        focusUserNavigation =
          event.navigationTrigger === 'imperative' && !event.restoredState;
        previousHeading = document.querySelector<HTMLElement>('#main-content h1');
        previousHeadingText = previousHeading?.textContent?.trim() || '';
        return;
      }
      if (!(event instanceof NavigationEnd)) return;
      if (initialNavigation) {
        initialNavigation = false;
        return;
      }

      // Popstate navigation is restoring a previously captured browser
      // position/focus. Do not replace that native restoration with H1 focus.
      if (!focusUserNavigation) return;

      // Fragment navigation already has a native scroll target. Do not
      // replace it with generic page focus.
      if (event.urlAfterRedirects.includes('#')) {
        return;
      }

      this.focusRouteDestination(previousHeading, previousHeadingText);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.routeObserver?.disconnect();
  }

  private focusRouteDestination(
    previousHeading: HTMLElement | null,
    previousHeadingText: string,
  ): void {
    this.routeObserver?.disconnect();
    const main = document.getElementById('main-content');
    if (!main) return;

    const focusReadyDestination = () => {
      const heading = main.querySelector<HTMLElement>('h1');
      // NavigationEnd can fire while the outlet still contains the previous
      // route. Wait for the destination heading instead of focusing the
      // shared main container during that transient state.
      if (!heading) return;
      if (
        heading &&
        heading === previousHeading &&
        heading.textContent?.trim() === previousHeadingText
      ) {
        return;
      }

      this.routeObserver?.disconnect();
      const destination = heading;
      if (!destination.hasAttribute('tabindex'))
        destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });

      const announcement = document.getElementById('route-announcer');
      if (announcement) {
        const label = heading?.textContent?.trim() || 'Conteúdo principal';
        announcement.textContent = `Navegação concluída: ${label}`;
      }
    };

    this.routeObserver = new MutationObserver(focusReadyDestination);
    this.routeObserver.observe(main, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-busy'],
    });
    focusReadyDestination();
  }
}
