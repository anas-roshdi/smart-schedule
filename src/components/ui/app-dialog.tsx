import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react-native';

export type DialogVariant = 'error' | 'warning' | 'info' | 'success';

export interface AppDialogProps {
  visible: boolean;
  variant?: DialogVariant;
  title: string;
  message?: string;
  children?: React.ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  loading?: boolean;
  destructive?: boolean;
  onRequestClose?: () => void;
}

export function AppDialog({
  visible,
  variant = 'info',
  title,
  message,
  children,
  primaryLabel = 'حسناً',
  onPrimary,
  secondaryLabel,
  onSecondary,
  loading = false,
  destructive = false,
  onRequestClose,
}: AppDialogProps) {
  const renderIcon = () => {
    switch (variant) {
      case 'error':
        return <AlertCircle size={56} color="#ef4444" className="mb-4" />;
      case 'warning':
        return <AlertTriangle size={56} color="#f59e0b" className="mb-4" />;
      case 'success':
        return <CheckCircle2 size={56} color="#22c55e" className="mb-4" />;
      case 'info':
      default:
        return <Info size={56} color="#4f46e5" className="mb-4" />;
    }
  };

  const isPrimaryDestructive =
    destructive && (variant === 'error' || variant === 'warning');

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={loading ? undefined : onRequestClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-6">
        <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-lg">
          {renderIcon()}

          <Text
            style={{ textAlign: 'center', writingDirection: 'rtl', lineHeight: 28 }}
            className="text-lg font-extrabold text-slate-900 mb-2 text-center"
          >
            {title}
          </Text>

          {message ? (
            <Text
              style={{ textAlign: 'center', writingDirection: 'rtl', lineHeight: 22 }}
              className="text-sm text-slate-500 mb-4 text-center leading-relaxed"
            >
              {message}
            </Text>
          ) : null}

          {children ? <View className="w-full mb-4">{children}</View> : null}

          {secondaryLabel ? (
            <View className="flex-row gap-3 w-full mt-2">
              <TouchableOpacity
                accessibilityRole="button"
                disabled={loading}
                onPress={onSecondary || onRequestClose}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 items-center justify-center active:bg-slate-200"
              >
                <Text className="text-sm font-bold text-slate-700">
                  {secondaryLabel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                disabled={loading}
                onPress={onPrimary}
                className={`flex-1 py-3.5 rounded-2xl items-center justify-center ${
                  isPrimaryDestructive
                    ? 'bg-rose-600 active:bg-rose-700'
                    : 'bg-indigo-600 active:bg-indigo-700'
                }`}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-sm font-bold text-white">
                    {primaryLabel}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              accessibilityRole="button"
              disabled={loading}
              onPress={onPrimary || onRequestClose}
              className={`w-full py-3.5 rounded-2xl items-center justify-center mt-2 ${
                isPrimaryDestructive
                  ? 'bg-rose-600 active:bg-rose-700'
                  : 'bg-indigo-600 active:bg-indigo-700'
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-sm font-bold text-white">
                  {primaryLabel}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
