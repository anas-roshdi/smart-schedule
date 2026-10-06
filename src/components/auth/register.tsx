import { CheckCircle2, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import type { AuthView } from './auth-container';

type Gender = 'أنثى' | 'ذكر';

interface RegisterProps {
  onNavigate: (view: AuthView) => void;
  onAuthSuccess: () => void;
}

export function Register({ onNavigate, onAuthSuccess }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Optional fields
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>('ذكر');
  const [major, setMajor] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [studentId, setStudentId] = useState('');

  const validateEmail = (val: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!isValid && val.trim() !== '') {
      setEmailError('صيغة البريد الإلكتروني غير صحيحة');
    } else {
      setEmailError('');
    }
    return isValid;
  };

  const handleRegister = () => {
    if (validateEmail(email)) {
      console.log('Register attempt', { name, email, password });
      setShowSuccessModal(true);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-12" contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 32 }} className="mt-8 mb-8 pb-1 text-3xl font-extrabold text-slate-900 text-center">
        إنشاء حساب جديد
      </Text>

      {/* ── Required Information ── */}

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          الاسم الكامل <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900"
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="أدخل اسمك الكامل"
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          البريد الإلكتروني <Text className="text-red-500">*</Text>
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
          }}
          onBlur={() => validateEmail(email)}
        />
        {!!emailError && (
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
            {emailError}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          كلمة المرور <Text className="text-red-500">*</Text>
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
            onChangeText={setPassword}
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

      <View className="mb-8">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          تأكيد كلمة المرور <Text className="text-red-500">*</Text>
        </Text>
        {/* The container explicitly disables RTL mirroring for layout positioning */}
        <View style={{ direction: 'ltr', position: 'relative', justifyContent: 'center' }}>
          <TextInput
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900"
            style={{ paddingLeft: 48, paddingRight: 16, textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
            placeholder="أعد إدخال كلمة المرور"
            placeholderTextColor="#64748b"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {/* Absolute Left button - explicit zIndex and pixel left position */}
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ position: 'absolute', left: 12, zIndex: 20, padding: 4 }}
            activeOpacity={0.7}
          >
            {showConfirmPassword ? (
              <EyeOff color="#64748b" size={22} />
            ) : (
              <Eye color="#64748b" size={22} />
            )}
          </TouchableOpacity>
        </View>
      </View>



      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          رقم الجوال
        </Text>
        <TextInput
          className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900"
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="05XXXXXXXX"
          placeholderTextColor="#64748b"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          تاريخ الميلاد
        </Text>
        <TextInput
          className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900"
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#64748b"
          value={dob}
          onChangeText={setDob}
        />
      </View>

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          الجنس <Text className="text-red-500">*</Text>
        </Text>
        <View className="flex-row rounded-xl border border-slate-200 bg-slate-50 p-1">
          <TouchableOpacity
            onPress={() => setGender('أنثى')}
            className="flex-1 rounded-lg py-3 items-center"
            style={[
              gender === 'أنثى' && { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }
            ]}
          >
            <Text style={{ textAlign: 'center', writingDirection: 'rtl', color: gender === 'أنثى' ? '#0f172a' : '#64748b' }} className="pb-1 font-bold">
              أنثى
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setGender('ذكر')}
            className="flex-1 rounded-lg py-3 items-center"
            style={[
              gender === 'ذكر' && { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }
            ]}
          >
            <Text style={{ textAlign: 'center', writingDirection: 'rtl', color: gender === 'ذكر' ? '#0f172a' : '#64748b' }} className="pb-1 font-bold">
              ذكر
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          التخصص
        </Text>
        <TextInput
          className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900"
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="أدخل تخصصك"
          placeholderTextColor="#64748b"
          value={major}
          onChangeText={setMajor}
        />
      </View>

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          المستوى الدراسي
        </Text>
        <TextInput
          className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900"
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="مثال: 3"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={academicLevel}
          onChangeText={setAcademicLevel}
        />
      </View>

      <View className="mb-8">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          الرقم الجامعي
        </Text>
        <TextInput
          className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900"
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="أدخل رقمك الجامعي"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={studentId}
          onChangeText={setStudentId}
        />
      </View>

      {/* ── Actions ── */}
      <TouchableOpacity
        onPress={handleRegister}
        className="mb-6 items-center justify-center rounded-2xl bg-indigo-600 py-4 shadow-sm"
      >
        <Text style={{ textAlign: 'left' }} className="pb-1 text-base font-bold text-white">
          إنشاء الحساب
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center items-center mb-12">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl' }} className="text-sm font-bold text-slate-500">
          لديك حساب بالفعل؟{' '}
        </Text>
        <Text onPress={() => onNavigate('login')} className="text-indigo-600 font-bold text-sm">
          تسجيل الدخول
        </Text>
      </View>

      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-6 w-full items-center shadow-lg">
            <CheckCircle2 color="#22c55e" size={64} className="mb-4" />
            <Text style={{ textAlign: 'center', writingDirection: 'rtl', lineHeight: 32 }} className="text-xl font-extrabold text-slate-900 mb-6 text-center">
              تم إنشاء الحساب بنجاح
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                onNavigate('login');
              }}
              className="w-full items-center justify-center rounded-2xl bg-indigo-600 py-4"
            >
              <Text className="text-base font-bold text-white">الذهاب لتسجيل الدخول</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
