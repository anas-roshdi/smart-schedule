import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { ApiError } from '../../lib/api';
import { changePassword } from '../../lib/auth';
import { useDialog } from '../ui/dialog-provider';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const { showDialog } = useDialog();
  const scrollRef = useRef<ScrollView>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setGeneralError(null);
    setFieldErrors({});
  };

  const handleClose = () => {
    if (isSaving) return;
    resetForm();
    onClose();
  };

  const handleFieldChange = (field: string) => {
    if (generalError) {
      setGeneralError(null);
    }
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const displayGeneralError = (msg: string) => {
    Keyboard.dismiss();
    setGeneralError(msg);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const validateLocally = (): boolean => {
    const errors: Record<string, string> = {};

    if (!currentPassword.trim()) {
      errors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }

    if (!newPassword.trim()) {
      errors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف';
    } else if (currentPassword && newPassword === currentPassword) {
      errors.newPassword = 'كلمة المرور الجديدة يجب أن تختلف عن الحالية';
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'تأكيد كلمة المرور الجديدة مطلوب';
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      Keyboard.dismiss();
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setGeneralError(null);

    if (!validateLocally()) {
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      handleClose();
      setTimeout(() => {
        showDialog({
          variant: 'success',
          title: 'تم تغيير كلمة المرور',
          message: 'تم تسجيل خروجك من الأجهزة الأخرى',
        });
      }, 150);
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 403 || err.code === 'WRONG_PASSWORD') {
          setGeneralError(null);
          const msg = err.message || 'كلمة المرور الحالية غير صحيحة';
          setFieldErrors((prev) => ({
            ...prev,
            currentPassword: msg,
          }));
        } else if (
          err.status === 400 &&
          err.errors &&
          Array.isArray(err.errors) &&
          err.errors.length > 0
        ) {
          const newErrors: Record<string, string> = {};
          const unmapped: string[] = [];
          const validFields = ['currentPassword', 'newPassword', 'confirmPassword'];

          for (const item of err.errors) {
            if (item.field && validFields.includes(item.field)) {
              newErrors[item.field] = item.message;
            } else {
              unmapped.push(item.message || err.message);
            }
          }

          setFieldErrors((prev) => ({ ...prev, ...newErrors }));
          if (unmapped.length > 0) {
            displayGeneralError(unmapped.join(' • '));
          } else {
            setGeneralError(null);
          }
        } else if (err.status === 0) {
          displayGeneralError(err.message || 'تعذر الاتصال بالخادم، تأكد من اتصالك بالشبكة');
        } else {
          displayGeneralError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور');
        }
      } else {
        displayGeneralError('حدث خطأ غير متوقع');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center border-b border-slate-100 px-5 pb-4 pt-2">
          <TouchableOpacity
            onPress={handleClose}
            disabled={isSaving}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
          >
            <ArrowRight size={20} color="#475569" />
          </TouchableOpacity>
          <Text
            className="flex-1 text-center text-xl font-extrabold text-slate-900 mr-10"
            style={{ writingDirection: 'rtl' }}
          >
            تغيير كلمة المرور
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* General Error Bar */}
          {!!generalError && (
            <View className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3">
              <Text
                style={{ textAlign: 'right', writingDirection: 'rtl' }}
                className="text-sm font-bold text-red-600 leading-relaxed"
              >
                {generalError}
              </Text>
            </View>
          )}

          {/* Current Password */}
          <View className="mb-4">
            <Text
              style={{
                textAlign: 'left',
                writingDirection: 'rtl',
                width: '100%',
              }}
              className="mb-2 text-sm font-bold text-slate-700"
            >
              كلمة المرور الحالية
            </Text>
            <View style={{ direction: 'ltr', position: 'relative', justifyContent: 'center' }}>
              <TextInput
                editable={!isSaving}
                className={`rounded-xl border ${
                  fieldErrors.currentPassword ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 p-4 text-base text-slate-900`}
                style={{
                  paddingLeft: 48,
                  paddingRight: 16,
                  textAlign: 'right',
                  writingDirection: 'rtl',
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                }}
                placeholder="أدخل كلمة المرور الحالية"
                placeholderTextColor="#64748b"
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={(val) => {
                  handleFieldChange('currentPassword');
                  setCurrentPassword(val);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{
                  position: 'absolute',
                  left: 12,
                  zIndex: 20,
                  padding: 4,
                }}
                activeOpacity={0.7}
                disabled={isSaving}
              >
                {showCurrentPassword ? (
                  <EyeOff color="#64748b" size={22} />
                ) : (
                  <Eye color="#64748b" size={22} />
                )}
              </TouchableOpacity>
            </View>
            {!!fieldErrors.currentPassword && (
              <Text
                style={{
                  textAlign: 'left',
                  writingDirection: 'rtl',
                  width: '100%',
                }}
                className="mt-1 text-xs text-red-500"
              >
                {fieldErrors.currentPassword}
              </Text>
            )}
          </View>

          {/* New Password */}
          <View className="mb-4">
            <Text
              style={{
                textAlign: 'left',
                writingDirection: 'rtl',
                width: '100%',
              }}
              className="mb-2 text-sm font-bold text-slate-700"
            >
              كلمة المرور الجديدة
            </Text>
            <View style={{ direction: 'ltr', position: 'relative', justifyContent: 'center' }}>
              <TextInput
                editable={!isSaving}
                className={`rounded-xl border ${
                  fieldErrors.newPassword ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 p-4 text-base text-slate-900`}
                style={{
                  paddingLeft: 48,
                  paddingRight: 16,
                  textAlign: 'right',
                  writingDirection: 'rtl',
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                }}
                placeholder="أدخل كلمة المرور الجديدة"
                placeholderTextColor="#64748b"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={(val) => {
                  handleFieldChange('newPassword');
                  setNewPassword(val);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  left: 12,
                  zIndex: 20,
                  padding: 4,
                }}
                activeOpacity={0.7}
                disabled={isSaving}
              >
                {showNewPassword ? (
                  <EyeOff color="#64748b" size={22} />
                ) : (
                  <Eye color="#64748b" size={22} />
                )}
              </TouchableOpacity>
            </View>
            {!!fieldErrors.newPassword && (
              <Text
                style={{
                  textAlign: 'left',
                  writingDirection: 'rtl',
                  width: '100%',
                }}
                className="mt-1 text-xs text-red-500"
              >
                {fieldErrors.newPassword}
              </Text>
            )}
          </View>

          {/* Confirm New Password */}
          <View className="mb-8">
            <Text
              style={{
                textAlign: 'left',
                writingDirection: 'rtl',
                width: '100%',
              }}
              className="mb-2 text-sm font-bold text-slate-700"
            >
              تأكيد كلمة المرور الجديدة
            </Text>
            <View style={{ direction: 'ltr', position: 'relative', justifyContent: 'center' }}>
              <TextInput
                editable={!isSaving}
                className={`rounded-xl border ${
                  fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 p-4 text-base text-slate-900`}
                style={{
                  paddingLeft: 48,
                  paddingRight: 16,
                  textAlign: 'right',
                  writingDirection: 'rtl',
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                }}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                placeholderTextColor="#64748b"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(val) => {
                  handleFieldChange('confirmPassword');
                  setConfirmPassword(val);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  left: 12,
                  zIndex: 20,
                  padding: 4,
                }}
                activeOpacity={0.7}
                disabled={isSaving}
              >
                {showConfirmPassword ? (
                  <EyeOff color="#64748b" size={22} />
                ) : (
                  <Eye color="#64748b" size={22} />
                )}
              </TouchableOpacity>
            </View>
            {!!fieldErrors.confirmPassword && (
              <Text
                style={{
                  textAlign: 'left',
                  writingDirection: 'rtl',
                  width: '100%',
                }}
                className="mt-1 text-xs text-red-500"
              >
                {fieldErrors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            className={`mb-12 items-center justify-center rounded-2xl py-4 shadow-sm ${
              isSaving ? 'bg-indigo-400' : 'bg-indigo-600'
            }`}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text
                style={{ textAlign: 'left' }}
                className="pb-1 text-base font-bold text-white"
              >
                حفظ كلمة المرور
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}