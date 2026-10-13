import { CheckCircle2, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { AuthView } from './auth-container';
import { ApiError } from '../../lib/api';
import { register } from '../../lib/auth';

type Gender = 'أنثى' | 'ذكر';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  gender: Gender;
  studentId?: string;
  major?: string;
  academicLevel?: number;
  phone?: string;
  dob?: string;
}

export function buildRegisterPayload(params: {
  name: string;
  email: string;
  password: string;
  gender: Gender;
  studentId?: string;
  major?: string;
  academicLevel?: string;
  phone?: string;
  dob?: string;
}): RegisterPayload {
  const payload: RegisterPayload = {
    name: params.name.trim(),
    email: params.email.trim(),
    password: params.password,
    gender: params.gender,
  };

  const sId = params.studentId?.trim();
  if (sId) payload.studentId = sId;

  const maj = params.major?.trim();
  if (maj) payload.major = maj;

  const lvl = params.academicLevel?.trim();
  if (lvl) payload.academicLevel = Number(lvl);

  const ph = params.phone?.trim();
  if (ph) payload.phone = ph;

  const d = params.dob?.trim();
  if (d) payload.dob = d;

  return payload;
}

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
  const [isLoading, setIsLoading] = useState(false);

  // Error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [academicLevelError, setAcademicLevelError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [majorError, setMajorError] = useState('');
  const [studentIdError, setStudentIdError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [dobError, setDobError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Optional fields
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>('ذكر');
  const [major, setMajor] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [studentId, setStudentId] = useState('');

  const clearErrors = () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setAcademicLevelError('');
    setGenderError('');
    setMajorError('');
    setStudentIdError('');
    setPhoneError('');
    setDobError('');
    setGeneralError('');
  };

  const validateEmail = (val: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!isValid && val.trim() !== '') {
      setEmailError('صيغة البريد الإلكتروني غير صحيحة');
    } else {
      setEmailError('');
    }
    return isValid;
  };

  const handleRegister = async () => {
    clearErrors();
    let hasError = false;

    if (!name.trim()) {
      setNameError('الاسم الكامل مطلوب');
      hasError = true;
    }

    if (!validateEmail(email)) {
      if (email.trim() === '') {
        setEmailError('البريد الإلكتروني مطلوب');
      }
      hasError = true;
    }

    if (password.length < 8) {
      setPasswordError('كلمة المرور يجب ألا تقل عن 8 أحرف');
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('كلمتا المرور غير متطابقتين');
      hasError = true;
    }

    const trimmedLevel = academicLevel.trim();
    if (trimmedLevel !== '') {
      const levelNum = Number(trimmedLevel);
      if (!Number.isInteger(levelNum) || levelNum < 1 || levelNum > 12) {
        setAcademicLevelError('المستوى الدراسي يجب أن يكون رقماً بين 1 و 12');
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    const payload = buildRegisterPayload({
      name,
      email,
      password,
      gender,
      studentId,
      major,
      academicLevel,
      phone,
      dob,
    });

    setIsLoading(true);
    try {
      await register(payload);
      setShowSuccessModal(true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400 && error.errors && Array.isArray(error.errors)) {
          const unhandled: string[] = [];
          for (const item of error.errors) {
            switch (item.field) {
              case 'name':
                setNameError(item.message);
                break;
              case 'email':
                setEmailError(item.message);
                break;
              case 'password':
                setPasswordError(item.message);
                break;
              case 'gender':
                setGenderError(item.message);
                break;
              case 'studentId':
                setStudentIdError(item.message);
                break;
              case 'major':
                setMajorError(item.message);
                break;
              case 'academicLevel':
                setAcademicLevelError(item.message);
                break;
              case 'phone':
                setPhoneError(item.message);
                break;
              case 'dob':
                setDobError(item.message);
                break;
              default:
                unhandled.push(item.message);
                break;
            }
          }
          if (unhandled.length > 0) {
            setGeneralError(unhandled.join(' - '));
          } else if (error.errors.length === 0 && error.message) {
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
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-12" contentContainerStyle={{ paddingBottom: 100 }}>
      <Text style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 32 }} className="mt-8 mb-8 pb-1 text-3xl font-extrabold text-slate-900 text-center">
        إنشاء حساب جديد
      </Text>

      {/* General Error Banner */}
      {!!generalError && (
        <View className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3">
          <Text style={{ textAlign: 'center', writingDirection: 'rtl' }} className="text-sm font-bold text-red-600">
            {generalError}
          </Text>
        </View>
      )}

      {/* ── Required Information ── */}

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          الاسم الكامل <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className={`rounded-xl border ${nameError ? 'border-red-500' : 'border-slate-200'} bg-slate-50 p-4 text-base text-slate-900`}
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="أدخل اسمك الكامل"
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (nameError) setNameError('');
            if (generalError) setGeneralError('');
          }}
        />
        {!!nameError && (
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
            {nameError}
          </Text>
        )}
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

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          كلمة المرور <Text className="text-red-500">*</Text>
        </Text>
        {/* The container explicitly disables RTL mirroring for layout positioning */}
        <View style={{ direction: 'ltr', position: 'relative', justifyContent: 'center' }}>
          <TextInput
            className={`rounded-xl border ${passwordError ? 'border-red-500' : 'border-slate-200'} bg-slate-50 p-4 text-base text-slate-900`}
            style={{ paddingLeft: 48, paddingRight: 16, textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
            placeholder="أدخل كلمة المرور"
            placeholderTextColor="#64748b"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (passwordError) setPasswordError('');
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
        {!!passwordError && (
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
            {passwordError}
          </Text>
        )}
      </View>

      <View className="mb-8">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          تأكيد كلمة المرور <Text className="text-red-500">*</Text>
        </Text>
        {/* The container explicitly disables RTL mirroring for layout positioning */}
        <View style={{ direction: 'ltr', position: 'relative', justifyContent: 'center' }}>
          <TextInput
            className={`rounded-xl border ${confirmPasswordError ? 'border-red-500' : 'border-slate-200'} bg-slate-50 p-4 text-base text-slate-900`}
            style={{ paddingLeft: 48, paddingRight: 16, textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
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
        {!!confirmPasswordError && (
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
            {confirmPasswordError}
          </Text>
        )}
      </View>

      {/* ── Optional Information ── */}

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          رقم الجوال
        </Text>
        <TextInput
          className={`rounded-xl border ${phoneError ? 'border-red-500' : 'border-slate-200'} bg-slate-50 p-4 text-base text-slate-900`}
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="05XXXXXXXX"
          placeholderTextColor="#64748b"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(val) => {
            setPhone(val);
            if (phoneError) setPhoneError('');
            if (generalError) setGeneralError('');
          }}
        />
        {!!phoneError && (
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
            {phoneError}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          تاريخ الميلاد
        </Text>
        <TextInput
          className={`rounded-xl border ${dobError ? 'border-red-500' : 'border-slate-200'} bg-slate-50 p-4 text-base text-slate-900`}
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#64748b"
          value={dob}
          onChangeText={(val) => {
            setDob(val);
            if (dobError) setDobError('');
            if (generalError) setGeneralError('');
          }}
        />
        {!!dobError && (
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
            {dobError}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          الجنس <Text className="text-red-500">*</Text>
        </Text>
        <View className={`flex-row rounded-xl border ${genderError ? 'border-red-500' : 'border-slate-200'} bg-slate-50 p-1`}>
          <TouchableOpacity
            onPress={() => {
              setGender('أنثى');
              if (genderError) setGenderError('');
              if (generalError) setGeneralError('');
            }}
            className="flex-1 rounded-lg py-3 items-center"
            style={[
              gender === 'أنثى' && { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
            ]}
          >
            <Text style={{ textAlign: 'center', writingDirection: 'rtl', color: gender === 'أنثى' ? '#0f172a' : '#64748b' }} className="pb-1 font-bold">
              أنثى
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setGender('ذكر');
              if (genderError) setGenderError('');
              if (generalError) setGeneralError('');
            }}
            className="flex-1 rounded-lg py-3 items-center"
            style={[
              gender === 'ذكر' && { backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
            ]}
          >
            <Text style={{ textAlign: 'center', writingDirection: 'rtl', color: gender === 'ذكر' ? '#0f172a' : '#64748b' }} className="pb-1 font-bold">
              ذكر
            </Text>
          </TouchableOpacity>
        </View>
        {!!genderError && (
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
            {genderError}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          التخصص
        </Text>
        <TextInput
          className={`rounded-xl border ${majorError ? 'border-red-500' : 'border-slate-200'} bg-slate-50 p-4 text-base text-slate-900`}
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="أدخل تخصصك"
          placeholderTextColor="#64748b"
          value={major}
          onChangeText={(val) => {
            setMajor(val);
            if (majorError) setMajorError('');
            if (generalError) setGeneralError('');
          }}
        />
        {!!majorError && (
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
            {majorError}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          المستوى الدراسي
        </Text>
        <TextInput
          className={`rounded-xl border ${academicLevelError ? 'border-red-500' : 'border-slate-200'} bg-slate-50 p-4 text-base text-slate-900`}
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="مثال: 3"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={academicLevel}
          onChangeText={(val) => {
            setAcademicLevel(val);
            if (academicLevelError) setAcademicLevelError('');
            if (generalError) setGeneralError('');
          }}
        />
        {!!academicLevelError && (
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
            {academicLevelError}
          </Text>
        )}
      </View>

      <View className="mb-8">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
          الرقم الجامعي
        </Text>
        <TextInput
          className={`rounded-xl border ${studentIdError ? 'border-red-500' : 'border-slate-200'} bg-slate-50 p-4 text-base text-slate-900`}
          style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="أدخل رقمك الجامعي"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={studentId}
          onChangeText={(val) => {
            setStudentId(val);
            if (studentIdError) setStudentIdError('');
            if (generalError) setGeneralError('');
          }}
        />
        {!!studentIdError && (
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mt-1 text-xs text-red-500">
            {studentIdError}
          </Text>
        )}
      </View>

      {/* ── Actions ── */}
      <TouchableOpacity
        onPress={handleRegister}
        disabled={isLoading}
        className={`mb-6 items-center justify-center rounded-2xl bg-indigo-600 py-4 shadow-sm ${isLoading ? 'opacity-70' : ''}`}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={{ textAlign: 'left' }} className="pb-1 text-base font-bold text-white">
            إنشاء الحساب
          </Text>
        )}
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
