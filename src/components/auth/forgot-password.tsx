import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiError } from '../../lib/api';
import { requestPasswordReset } from '../../lib/auth';
import type { AuthView } from './auth-container';

interface ForgotPasswordProps {
  onNavigate: (view: AuthView) => void;
  onEmailSent: (email: string) => void;
  errorMessage?: string | null;
  onClearErrorMessage?: () => void;
}

export function ForgotPassword({
  onNavigate,
  onEmailSent,
  errorMessage,
  onClearErrorMessage,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const displayError = generalError || errorMessage || '';

  const validateEmail = (val: string) => {
    const v = val.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!isValid && v !== '') {
      setEmailError('صيغة البريد الإلكتروني غير صحيحة');
    } else {
      setEmailError('');
    }
    return isValid;
  };

  const handleSendLink = async () => {
    setGeneralError('');
    if (onClearErrorMessage) {
      onClearErrorMessage();
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('يرجى إدخال البريد الإلكتروني');
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset(trimmedEmail);
      onEmailSent(trimmedEmail);
    } catch (error) {
      if (error instanceof ApiError) {
        setGeneralError(error.message);
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
        onPress={() => onNavigate('login')}
        disabled={isLoading}
        className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 mb-6"
      >
        <ArrowRight size={20} color="#475569" />
      </TouchableOpacity>

      <View className="flex-1 justify-center pb-20">
        <Text
          style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 42 }}
          className="mb-4 pb-1 text-3xl font-extrabold text-slate-900 text-center"
        >
          استعادة كلمة المرور
        </Text>
        <Text
          style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 24 }}
          className="mb-8 text-sm text-slate-500 text-center px-4"
        >
          أدخل بريدك الإلكتروني المسجل وسنرسل لك رمزاً لاستعادة كلمة المرور.
        </Text>

        {/* General Error Banner */}
        {!!displayError && (
          <View className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3">
            <Text
              style={{ textAlign: 'center', writingDirection: 'rtl' }}
              className="text-sm font-bold text-red-600"
            >
              {displayError}
            </Text>
          </View>
        )}

        {/* Email Field */}
        <View className="mb-8">
          <Text
            style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }}
            className="mb-2 text-sm font-bold text-slate-700"
          >
            البريد الإلكتروني
          </Text>
          <TextInput
            editable={!isLoading}
            className={`rounded-xl border ${
              emailError ? 'border-red-500' : 'border-slate-200'
            } bg-slate-50 p-4 text-base text-slate-900`}
            style={{
              textAlign: 'right',
              writingDirection: 'rtl',
              textAlignVertical: 'center',
              includeFontPadding: false,
            }}
            placeholder="example@student.edu.sa"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (emailError) setEmailError('');
              if (generalError) setGeneralError('');
              if (onClearErrorMessage) onClearErrorMessage();
            }}
            onBlur={() => validateEmail(email)}
          />
          {!!emailError && (
            <Text
              style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }}
              className="mt-1 text-xs text-red-500"
            >
              {emailError}
            </Text>
          )}
          <Text
            style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }}
            className="mt-1.5 text-xs text-slate-400"
          >
            سنرسل رمزاً من 4 أرقام إلى بريدك إن كان مسجلاً لدينا
          </Text>
        </View>

        {/* Send Link Button */}
        <TouchableOpacity
          onPress={handleSendLink}
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
              إرسال الرمز
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
