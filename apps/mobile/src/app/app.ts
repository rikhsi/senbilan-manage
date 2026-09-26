import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { AppToastContainerComponent } from '@senbilan/design-system/ui';

@Component({
  selector: 'mobile-root',
  imports: [IonApp, IonRouterOutlet, AppToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
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
      window.setTimeout(remove, 500);
    });
  }
}
