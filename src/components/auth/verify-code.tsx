import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import type { AuthView } from './auth-container';

interface VerifyCodeProps {
  onNavigate: (view: AuthView) => void;
}

export function VerifyCode({ onNavigate }: VerifyCodeProps) {
  const [code, setCode] = useState('');

  const handleVerify = () => {
    if (code.length === 4) {
      onNavigate('reset-password');
    }
  };

  return (
    <View className="flex-1 px-6 pt-12">
      <TouchableOpacity onPress={() => onNavigate('forgot')} className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 mb-6">
        <ArrowRight size={20} color="#475569" />
      </TouchableOpacity>
      
      <View className="flex-1 justify-center pb-20">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 32 }} className="mb-4 pb-1 text-3xl font-extrabold text-slate-900 text-center">
          أدخل الرمز
        </Text>
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 24 }} className="mb-8 text-sm text-slate-500 text-center px-4">
          أدخل الرمز المكون من 4 أرقام المرسل إلى بريدك
        </Text>

        <TextInput
          className="rounded-xl border border-slate-200 bg-slate-50 p-4 pb-1 text-3xl font-bold text-slate-900 text-center tracking-widest mb-8"
          style={{ includeFontPadding: false, textAlignVertical: 'center', lineHeight: 36 }}
          placeholder="0000"
          placeholderTextColor="#cbd5e1"
          keyboardType="numeric"
          maxLength={4}
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity
          onPress={handleVerify}
          className="mb-6 items-center justify-center rounded-2xl bg-indigo-600 py-4 shadow-sm"
        >
          <Text style={{ textAlign: 'left' }} className="pb-1 text-base font-bold text-white">
            تحقق
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
