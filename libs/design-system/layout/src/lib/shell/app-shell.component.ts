import { ChangeDetectionStrategy, Component, inject, input, model, output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ViewportService } from '@senbilan/design-system/ui';
import { AppBottomNavComponent } from '../bottom-nav/app-bottom-nav.component';
import { AppCommandPaletteComponent } from '../command-palette/app-command-palette.component';
import { AppHeaderComponent } from '../header/app-header.component';
import { LAYOUT_COMMAND_PALETTE } from '../layout-bridges';
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
          (search)="openPalette()"
          (notifications)="notifications.emit()"
          (profile)="profile.emit()"
          (settings)="settings.emit()"
          (logout)="logout.emit()"
        />

        <main class="app-shell__content" id="main-content">
          <ng-content />
          <router-outlet />
        </main>

        @if (viewport.isCompact()) {
          <app-bottom-nav [items]="navItems()" />
        }
      </div>

      @if (viewport.isCompact() && mobileNavOpen()) {
        <div class="app-shell__drawer-backdrop" (click)="mobileNavOpen.set(false)"></div>
        <div class="app-shell__drawer" role="dialog" aria-modal="true">
          <app-sidebar [items]="navItems()" [collapsed]="false" />
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
  private readonly palette = inject(LAYOUT_COMMAND_PALETTE, { optional: true });

  readonly navItems = input.required<readonly NavigationItem[]>();
  readonly breadcrumbs = input<readonly BreadcrumbItem[]>([]);
  readonly sidebarCollapsed = model(false);
  readonly mobileNavOpen = model(false);

  readonly notifications = output<void>();
  readonly profile = output<void>();
  readonly settings = output<void>();
  readonly logout = output<void>();

  protected openPalette(): void {
    this.palette?.open();
  }
}
