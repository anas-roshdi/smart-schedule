import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { AppDialog, DialogVariant } from './app-dialog';
import { ApiError } from '../../lib/api';

export interface DialogOptions {
  variant?: DialogVariant;
  title: string;
  message?: string;
  children?: ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void | Promise<void>;
  secondaryLabel?: string;
  onSecondary?: () => void | Promise<void>;
  destructive?: boolean;
}

export interface ShowErrorOptions {
  title?: string;
}

interface DialogContextValue {
  showDialog: (options: DialogOptions) => Promise<void>;
  showError: (error: unknown, options?: ShowErrorOptions) => Promise<void>;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogState, setDialogState] = useState<DialogOptions | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const resolverRef = useRef<(() => void) | null>(null);

  const hideDialog = useCallback(() => {
    setVisible(false);
    setLoading(false);
    if (resolverRef.current) {
      resolverRef.current();
      resolverRef.current = null;
    }
  }, []);

  const showDialog = useCallback((options: DialogOptions): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (resolverRef.current) {
        resolverRef.current();
      }
      resolverRef.current = resolve;
      setDialogState(options);
      setLoading(false);
      setVisible(true);
    });
  }, []);

  const showError = useCallback(
    (error: unknown, options?: ShowErrorOptions): Promise<void> => {
      let title = 'تنبيه';
      let message = 'حدث خطأ غير متوقع';

      const isApiError =
        error instanceof ApiError ||
        (Boolean(error) &&
          typeof error === 'object' &&
          (error as any).name === 'ApiError');

      if (isApiError) {
        const apiErr = error as ApiError;
        if (apiErr.status === 0) {
          title = 'لا يوجد اتصال';
          message = apiErr.message;
        } else {
          title = options?.title || 'تنبيه';
          message = apiErr.message || 'حدث خطأ غير متوقع';
        }
      }

      return showDialog({
        variant: 'error',
        title,
        message,
      });
    },
    [showDialog]
  );

  const handlePrimary = useCallback(async () => {
    if (!dialogState) return;
    if (dialogState.onPrimary) {
      try {
        setLoading(true);
        await dialogState.onPrimary();
        hideDialog();
      } catch {
        setLoading(false);
      }
    } else {
      hideDialog();
    }
  }, [dialogState, hideDialog]);

  const handleSecondary = useCallback(async () => {
    if (!dialogState) return;
    if (dialogState.onSecondary) {
      try {
        setLoading(true);
        await dialogState.onSecondary();
        hideDialog();
      } catch {
        setLoading(false);
      }
    } else {
      hideDialog();
    }
  }, [dialogState, hideDialog]);

  return (
    <DialogContext.Provider value={{ showDialog, showError, hideDialog }}>
      {children}
      {dialogState && (
        <AppDialog
          visible={visible}
          variant={dialogState.variant || 'info'}
          title={dialogState.title}
          message={dialogState.message}
          primaryLabel={dialogState.primaryLabel || 'حسناً'}
          onPrimary={handlePrimary}
          secondaryLabel={dialogState.secondaryLabel}
          onSecondary={handleSecondary}
          destructive={dialogState.destructive}
          loading={loading}
          onRequestClose={hideDialog}
        >
          {dialogState.children}
        </AppDialog>
      )}
    </DialogContext.Provider>
  );
}
