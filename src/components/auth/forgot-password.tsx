import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { AuthView } from './auth-container';

interface ForgotPasswordProps {
  onNavigate: (view: AuthView) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (val: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!isValid && val.trim() !== '') {
      setEmailError('صيغة البريد الإلكتروني غير صحيحة');
    } else {
      setEmailError('');
    }
    return isValid;
  };

  const handleSendLink = () => {
    if (validateEmail(email)) {
      console.log('Forgot password code sent to:', email);
      onNavigate('verify-code');
    }
  };

  return (
    <View className="flex-1 px-6 pt-12">
      <TouchableOpacity onPress={() => onNavigate('login')} className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 mb-6">
        <ArrowRight size={20} color="#475569" />
      </TouchableOpacity>

      <View className="flex-1 justify-center pb-20">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 42 }} className="mb-4 pb-1 text-3xl font-extrabold text-slate-900 text-center">
          استعادة كلمة المرور
        </Text>
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 24 }} className="mb-8 text-sm text-slate-500 text-center px-4">
          أدخل بريدك الإلكتروني المسجل وسنرسل لك رمزاً لاستعادة كلمة المرور.
        </Text>

        {/* Email Field */}
        <View className="mb-8">
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
            البريد الإلكتروني
          </Text>
          <TextInput
            className={`rounded-xl border ${emailError ? 'border-red-500' : 'border-slate-200'} bg-slate-50 p-4 text-base text-slate-900`}
            style={{ textAlign: 'right', textAlignVertical: 'center', includeFontPadding: false }}
            placeholder="example@student.edu.sa"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (emailError) setEmailError('');
            }}
            onBlur={() => validateEmail(email)}
          />
          {!!emailError && (
            <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
              {emailError}
            </Text>
          )}
        </View>

        {/* Send Link Button */}
        <TouchableOpacity
          onPress={handleSendLink}
          className="mb-6 items-center justify-center rounded-2xl bg-indigo-600 py-4 shadow-sm"
        >
          <Text style={{ textAlign: 'left' }} className="pb-1 text-base font-bold text-white">
            إرسال الرمز
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
