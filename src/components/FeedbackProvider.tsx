import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/darkColors';
import { ConfirmDialog, ConfirmDialogOptions } from './ConfirmDialog';

type ToastType = 'success' | 'error' | 'info';

type ToastState = {
  message: string;
  type: ToastType;
};

type FeedbackContextValue = {
  confirm: (options: ConfirmDialogOptions) => void;
  showToast: (message: string, type?: ToastType) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback deve ser usado dentro de <FeedbackProvider>.');
  }
  return context;
}

const TOAST_DURATION = 2500;

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [dialogOptions, setDialogOptions] = useState<ConfirmDialogOptions | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    setDialogOptions(options);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      setToast({ message, type });

      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, TOAST_DURATION);
    },
    [opacity]
  );

  const closeDialog = useCallback(() => {
    setDialogOptions(null);
  }, []);

  const backgroundColor =
    toast?.type === 'error'
      ? colors.error
      : toast?.type === 'info'
      ? colors.primaryDark
      : colors.success;

  return (
    <FeedbackContext.Provider value={{ confirm, showToast }}>
      {children}

      <ConfirmDialog visible={!!dialogOptions} options={dialogOptions} onCancel={closeDialog} />

      {toast ? (
        <View pointerEvents="none" style={styles.toastContainer}>
          <Animated.View style={[styles.toast, { backgroundColor, opacity }]}>
            <Text style={styles.toastMessage}>{toast.message}</Text>
          </Animated.View>
        </View>
      ) : null}
    </FeedbackContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    maxWidth: '90%',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 24,
  },
  toastMessage: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
