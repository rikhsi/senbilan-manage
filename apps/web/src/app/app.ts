import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppToastContainerComponent } from '@senbilan/design-system/ui';

@Component({
  selector: 'web-root',
  imports: [RouterOutlet, AppToastContainerComponent],
  template: `
    <router-outlet />
    <app-toast-container />
  `,
  styles: `
    :host {
      display: block;
      min-height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor() {
    afterNextRender(() => {
      const splash = document.getElementById('app-splash');
      if (!splash) {
        return;
      }
      splash.classList.add('is-done');
      const remove = () => splash.remove();
      splash.addEventListener('transitionend', remove, { once: true });
      // Fallback if transitionend never fires (display:none / reduced motion).
      window.setTimeout(remove, 500);
    });
  }
}
