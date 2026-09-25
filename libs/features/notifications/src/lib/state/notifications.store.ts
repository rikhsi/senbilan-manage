import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { NotificationRepository } from '@senbilan/core/application';
import { type NotificationId } from '@senbilan/core/domain';
import { NotificationMutations, notificationQueryKeys } from '@senbilan/entities/notification';
import { injectQueryClient } from '@tanstack/angular-query-experimental';

interface NotificationsUiState {
  unreadOnly: boolean;
  unreadCount: number;
  panelOpen: boolean;
}

const initialState: NotificationsUiState = {
  unreadOnly: false,
  unreadCount: 0,
  panelOpen: false,
};

/**
 * Client UI state for notifications + mark-read actions.
 * List data stays in TanStack Query; unread count is mirrored here for chrome badges.
 */
export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasUnread: computed(() => store.unreadCount() > 0),
    isPanelOpen: computed(() => store.panelOpen()),
  })),
  withMethods((store) => {
    const repo = inject(NotificationRepository);
    const mutations = inject(NotificationMutations);
    const queryClient = injectQueryClient();

    const refreshUnreadCount = async (signal?: AbortSignal): Promise<number> => {
      const count = await repo.countUnread(signal);
      patchState(store, { unreadCount: count });
      return count;
    };

    return {
      setUnreadOnly(unreadOnly: boolean): void {
        patchState(store, { unreadOnly });
      },

      setUnreadCount(unreadCount: number): void {
        patchState(store, { unreadCount });
      },

      setPanelOpen(panelOpen: boolean): void {
        patchState(store, { panelOpen });
      },

      openPanel(): void {
        patchState(store, { panelOpen: true });
      },

      closePanel(): void {
        patchState(store, { panelOpen: false });
      },

      togglePanel(): void {
        patchState(store, { panelOpen: !store.panelOpen() });
      },

      async refreshUnreadCount(signal?: AbortSignal): Promise<number> {
        return refreshUnreadCount(signal);
      },

      async markRead(id: NotificationId): Promise<void> {
        await mutations.markRead.mutateAsync(id);
        await refreshUnreadCount();
      },

      async markAllRead(): Promise<void> {
        await mutations.markAllRead.mutateAsync();
        patchState(store, { unreadCount: 0 });
      },

      async invalidateLists(): Promise<void> {
        await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      },
    };
  }),
);

export type NotificationsStore = InstanceType<typeof NotificationsStore>;
