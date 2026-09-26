import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { AuthStore } from '@senbilan/shared/auth';

@Component({
  selector: 'mobile-home-page',
  imports: [TranslocoPipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ 'app.name' | transloco }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding mobile-home">
      <h1 class="mobile-home__title">{{ 'app.name' | transloco }}</h1>
      <p class="mobile-home__welcome">
        {{ 'common.welcome' | transloco: { name: displayName() } }}
      </p>
      <ion-button expand="block" fill="outline" (click)="onLogout()">
        {{ 'common.logout' | transloco }}
      </ion-button>
    </ion-content>
  `,
  styles: `
    @use 'ds' as ds;

    .mobile-home__title {
      margin: 0 0 var(--app-space-2);
      font-size: var(--app-font-size-2xl);
      font-weight: var(--app-font-weight-bold);
      color: var(--app-color-text-primary);
    }

    .mobile-home__welcome {
      margin: 0 0 var(--app-space-6);
      color: var(--app-color-text-secondary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly displayName = computed(() => {
    const user = this.auth.user();
    if (!user) {
      return 'вЂ”';
    }
    const full = `${user.firstName} ${user.lastName}`.trim();
    return full || String(user.email);
  });

  protected async onLogout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/auth/login');
  }
}
