import { generateId } from '$lib/helpers/utils.helper';
import { writable } from 'svelte/store';

const DEFAULT_CONFIG: Partial<App.DialogConfig> = {
  center: true,
  fullScreen: false,
  transitionType: 'scale',
  preventDirtyClose: true
};

const FULLSCREEN_CONFIG: Partial<App.DialogConfig> = {
  center: false,
  noPadding: true,
  showClose: false,
  fullScreen: true,
  transitionType: 'fly',
  preventDirtyClose: true
};

function createDialogStore() {
  const { subscribe, update } = writable<App.DialogState>({ dialogs: [] });

  const addDialog = <T>(
    config: Omit<App.DialogConfig<T>, 'id'>,
    defaults: Partial<App.DialogConfig>
  ) => {
    const dialogId = generateId();
    update((state) => ({
      dialogs: [...state.dialogs, { ...defaults, ...config, id: dialogId }]
    }));
    return dialogId;
  };

  return {
    subscribe,
    open: <T>(config: Omit<App.DialogConfig<T>, 'id'>) => addDialog<T>(config, DEFAULT_CONFIG),
    openFullScreen: <T>(config: Omit<App.DialogConfig<T>, 'id'>) =>
      addDialog<T>(config, FULLSCREEN_CONFIG),
    close: (id: string) => {
      update((state) => {
        const dialog = state.dialogs.find((d) => d.id === id);
        dialog?.onClose?.();
        return { dialogs: state.dialogs.filter((d) => d.id !== id) };
      });
    },
    closeAll: () => {
      update((state) => {
        state.dialogs.forEach((dialog) => dialog.onClose?.());
        return { dialogs: [] };
      });
    }
  };
}

export const dialogStore = createDialogStore();
