import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ApiError } from '../../lib/api';
import { login } from '../../lib/auth';
import type { AuthView } from './auth-container';
import { WatiraLogo } from '../ui/WatiraLogo';

interface LoginProps {
  onNavigate: (view: AuthView) => void;
  onAuthSuccess: () => void;
}

export function Login({ onNavigate, onAuthSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async () => {
    setGeneralError('');
    if (validateEmail(email)) {
      if (!password) {
        setGeneralError('يرجى إدخال كلمة المرور');
        return;
      }
      setIsLoading(true);
      try {
        await login(email.trim(), password);
        onAuthSuccess();
      } catch (error) {
        if (error instanceof ApiError) {
          setGeneralError(error.message);
        } else {
          setGeneralError('حدث خطأ غير متوقع');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View className="flex-1 justify-center px-6">
      <View className="items-center mb-6">
        <WatiraLogo size={80} variant="badge" />
      </View>

      <Text style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 42 }} className="mb-2 pb-1 text-3xl font-extrabold text-slate-900 text-center">
        مرحباً بك في وتيرة
      </Text>
      <Text style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 24 }} className="mb-8 text-sm text-slate-500 text-center px-4">
        سجّل دخولك لتنظيم جدولك الجامعي بذكاء
      </Text>

      {/* General Error */}
      {!!generalError && (
        <View className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3">
          <Text style={{ textAlign: 'center', writingDirection: 'rtl' }} className="text-sm font-bold text-red-600">
            {generalError}
          </Text>
        </View>
      )}

      {/* Email Field */}
      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          البريد الإلكتروني
        </Text>
        <TextInput
          className={`rounded-xl border ${emailError ? 'border-red-500' : 'border-slate-200'} bg-slate-50 p-4 text-base text-slate-900`}
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="example@student.edu.sa"
          placeholderTextColor="#64748b"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (emailError) setEmailError('');
            if (generalError) setGeneralError('');
          }}
          onBlur={() => validateEmail(email)}
        />
        {!!emailError && (
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
            {emailError}
          </Text>
        )}
      </View>

      {/* Password Field */}
      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          كلمة المرور
        </Text>
        {/* The container explicitly disables RTL mirroring for layout positioning */}
        <View style={{ direction: 'ltr', position: 'relative', justifyContent: 'center' }}>
          <TextInput
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900"
            style={{ paddingLeft: 48, paddingRight: 16, textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
            placeholder="أدخل كلمة المرور"
            placeholderTextColor="#64748b"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (generalError) setGeneralError('');
            }}
          />
          {/* Absolute Left button - explicit zIndex and pixel left position */}
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', left: 12, zIndex: 20, padding: 4 }}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff color="#64748b" size={22} />
            ) : (
              <Eye color="#64748b" size={22} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={() => onNavigate('forgot')} className="mb-8 items-start">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl' }} className="text-sm font-bold text-indigo-600">
          نسيت كلمة المرور؟
        </Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoading}
        className={`mb-6 items-center justify-center rounded-2xl bg-indigo-600 py-4 shadow-sm ${isLoading ? 'opacity-70' : ''}`}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={{ textAlign: 'left' }} className="pb-1 text-base font-bold text-white">
            تسجيل الدخول
          </Text>
        )}
      </TouchableOpacity>

      {/* Register Link */}
      <View className="flex-row justify-center items-center mb-6">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl' }} className="text-sm font-bold text-slate-500">
          ليس لديك حساب؟{' '}
        </Text>
        <Text onPress={() => onNavigate('register')} className="text-indigo-600 font-bold text-sm">
          إنشاء حساب جديد
        </Text>
      </View>
    </View>
  );
}
