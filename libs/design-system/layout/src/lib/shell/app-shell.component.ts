import { ChangeDetectionStrategy, Component, inject, input, model, output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ViewportService } from '@senbilan/design-system/ui';
import { AppBottomNavComponent } from '../bottom-nav/app-bottom-nav.component';
import { AppCommandPaletteComponent } from '../command-palette/app-command-palette.component';
import { AppHeaderComponent } from '../header/app-header.component';
import { type BreadcrumbItem, type NavigationItem } from '../navigation.types';
import { AppSidebarComponent } from '../sidebar/app-sidebar.component';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    AppSidebarComponent,
    AppHeaderComponent,
    AppBottomNavComponent,
    AppCommandPaletteComponent,
  ],
  template: `
    <div
      class="app-shell"
      [class.app-shell--collapsed]="sidebarCollapsed()"
      [class.app-shell--compact]="viewport.isCompact()"
    >
      @if (!viewport.isCompact()) {
        <app-sidebar [items]="navItems()" [collapsed]="sidebarCollapsed()" />
      }

      <div class="app-shell__main">
        <app-header
          [breadcrumbs]="breadcrumbs()"
          [showMenuToggle]="viewport.isCompact()"
          [showCollapseToggle]="!viewport.isCompact()"
          [sidebarCollapsed]="sidebarCollapsed()"
          (menuToggle)="mobileNavOpen.set(true)"
          (collapseToggle)="sidebarCollapsed.set(!sidebarCollapsed())"
          (notifications)="notifications.emit()"
          (profile)="profile.emit()"
        />

        <main class="app-shell__content" id="main-content">
          <ng-content />
          <router-outlet />
        </main>

        @if (viewport.isCompact()) {
          <app-bottom-nav [items]="navItems()" />
        }
      </div>

      @if (viewport.isCompact()) {
        <div
          class="app-shell__drawer-layer"
          [class.app-shell__drawer-layer--open]="mobileNavOpen()"
          [attr.aria-hidden]="mobileNavOpen() ? null : 'true'"
        >
          <div class="app-shell__drawer-backdrop" (click)="mobileNavOpen.set(false)"></div>
          <div
            class="app-shell__drawer"
            role="dialog"
            aria-modal="true"
            [attr.inert]="mobileNavOpen() ? null : ''"
          >
            <app-sidebar [items]="navItems()" [collapsed]="false" />
          </div>
        </div>
      }

      <app-command-palette />
    </div>
  `,
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-shell-host' },
})
export class AppShellComponent {
  protected readonly viewport = inject(ViewportService);

  readonly navItems = input.required<readonly NavigationItem[]>();
  readonly breadcrumbs = input<readonly BreadcrumbItem[]>([]);
  readonly sidebarCollapsed = model(false);
  readonly mobileNavOpen = model(false);

  readonly notifications = output<void>();
  readonly profile = output<void>();
}
