import { ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiError } from '../../lib/api';
import { resetPassword } from '../../lib/auth';
import type { AuthView } from './auth-container';

interface ResetPasswordProps {
  onNavigate: (view: AuthView) => void;
  onAuthSuccess: () => void;
  resetToken: string;
  onResetComplete: () => void;
  onSessionExpired: () => void;
}

export function ResetPassword({
  onNavigate,
  resetToken,
  onResetComplete,
  onSessionExpired,
}: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    if (password.length < 8) {
      setPasswordError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(resetToken, password);
      setShowSuccessModal(true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'INVALID_RESET_TOKEN') {
          onSessionExpired();
          return;
        }
        if (error.errors && Array.isArray(error.errors)) {
          const pwdErr = error.errors.find((e) => e.field === 'password');
          if (pwdErr) {
            setPasswordError(pwdErr.message);
          } else {
            setGeneralError(error.message);
          }
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError('حدث خطأ غير متوقع');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 px-6 pt-12">
      <TouchableOpacity
        onPress={() => onNavigate('verify-code')}
        disabled={isLoading}
        className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 mb-6"
      >
        <ArrowRight size={20} color="#475569" />
      </TouchableOpacity>

      <View className="flex-1 justify-center pb-20">
        <Text
          style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 42 }}
          className="mb-8 pb-1 text-3xl font-extrabold text-slate-900 text-center"
        >
          إعداد كلمة مرور جديدة
        </Text>

        {/* General Error Banner */}
        {!!generalError && (
          <View className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3">
            <Text
              style={{ textAlign: 'center', writingDirection: 'rtl' }}
              className="text-sm font-bold text-red-600"
            >
              {generalError}
            </Text>
          </View>
        )}

        {/* New Password */}
        <View className="mb-4">
          <Text
            style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }}
            className="mb-2 text-sm font-bold text-slate-700"
          >
            كلمة المرور الجديدة <Text className="text-red-500">*</Text>
          </Text>
          <View
            style={{
              direction: 'ltr',
              position: 'relative',
              justifyContent: 'center',
            }}
          >
            <TextInput
              editable={!isLoading}
              className={`rounded-xl border ${
                passwordError ? 'border-red-500' : 'border-slate-200'
              } bg-slate-50 p-4 text-base text-slate-900`}
              style={{
                paddingLeft: 48,
                paddingRight: 16,
                textAlign: 'right',
                writingDirection: 'rtl',
                textAlignVertical: 'center',
                includeFontPadding: false,
              }}
              placeholder="أدخل كلمة المرور (8 أحرف على الأقل)"
              placeholderTextColor="#64748b"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (passwordError) setPasswordError('');
                if (generalError) setGeneralError('');
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', left: 12, zIndex: 20, padding: 4 }}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff color="#64748b" size={22} />
              ) : (
                <Eye color="#64748b" size={22} />
              )}
            </TouchableOpacity>
          </View>
          {!!passwordError && (
            <Text
              style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }}
              className="mt-1 text-xs text-red-500"
            >
              {passwordError}
            </Text>
          )}
        </View>

        {/* Confirm Password */}
        <View className="mb-8">
          <Text
            style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }}
            className="mb-2 text-sm font-bold text-slate-700"
          >
            تأكيد كلمة المرور الجديدة <Text className="text-red-500">*</Text>
          </Text>
          <View
            style={{
              direction: 'ltr',
              position: 'relative',
              justifyContent: 'center',
            }}
          >
            <TextInput
              editable={!isLoading}
              className={`rounded-xl border ${
                confirmPasswordError ? 'border-red-500' : 'border-slate-200'
              } bg-slate-50 p-4 text-base text-slate-900`}
              style={{
                paddingLeft: 48,
                paddingRight: 16,
                textAlign: 'right',
                writingDirection: 'rtl',
                textAlignVertical: 'center',
                includeFontPadding: false,
              }}
              placeholder="أعد إدخال كلمة المرور"
              placeholderTextColor="#64748b"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (confirmPasswordError) setConfirmPasswordError('');
                if (generalError) setGeneralError('');
              }}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: 'absolute', left: 12, zIndex: 20, padding: 4 }}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff color="#64748b" size={22} />
              ) : (
                <Eye color="#64748b" size={22} />
              )}
            </TouchableOpacity>
          </View>
          {!!confirmPasswordError && (
            <Text
              style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }}
              className="mt-1 text-xs text-red-500"
            >
              {confirmPasswordError}
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleReset}
          disabled={isLoading}
          className={`mb-6 items-center justify-center rounded-2xl py-4 shadow-sm ${
            isLoading ? 'bg-indigo-400' : 'bg-indigo-600'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{ textAlign: 'left' }}
              className="pb-1 text-base font-bold text-white"
            >
              حفظ
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-6 w-full items-center shadow-lg">
            <CheckCircle2 color="#22c55e" size={64} className="mb-4" />
            <Text
              style={{
                textAlign: 'center',
                writingDirection: 'rtl',
                lineHeight: 32,
              }}
              className="text-xl font-extrabold text-slate-900 mb-6 text-center"
            >
              تم تغيير كلمة المرور بنجاح
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                onResetComplete();
              }}
              className="w-full items-center justify-center rounded-2xl bg-indigo-600 py-4"
            >
              <Text className="text-base font-bold text-white">تسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
