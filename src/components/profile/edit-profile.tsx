import React, { useState, useEffect, useRef } from 'react';
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
import { fetchMe, updateProfile, UpdateProfilePayload, deleteAccount } from '../../lib/auth';
import { clearToken } from '../../lib/token-storage';
import { useDialog } from '../ui/dialog-provider';
import { useSchedule } from '../schedule/ScheduleContext';
import { router } from 'expo-router';

type Gender = 'أنثى' | 'ذكر';

interface LoadedProfile {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  major: string;
  academicLevel: string;
  studentId: string;
}

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function isValidPhone(val: string): boolean {
  if (!val || val.trim() === '') return true;
  return /^05\d{8}$/.test(val.trim());
}

function isValidDob(val: string): boolean {
  if (!val || val.trim() === '') return true;
  const trimmed = val.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }
  const now = new Date();
  if (date > now) return false;
  return true;
}

function isValidAcademicLevel(val: string): boolean {
  if (!val || val.trim() === '') return true;
  const trimmed = val.trim();
  if (!/^\d+$/.test(trimmed)) return false;
  const num = parseInt(trimmed, 10);
  return num >= 1 && num <= 12;
}

function isValidStudentId(val: string): boolean {
  if (!val || val.trim() === '') return true;
  return val.trim().length >= 5;
}

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { showDialog } = useDialog();
  const { resetSchedule } = useSchedule();
  const scrollRef = useRef<ScrollView>(null);
  const initialDataRef = useRef<LoadedProfile | null>(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteExpanded, setIsDeleteExpanded] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>('ذكر');
  const [major, setMajor] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [studentId, setStudentId] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const isEmailChanged =
    initialDataRef.current !== null &&
    email.trim() !== initialDataRef.current.email.trim();

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    setLoadError(null);
    setGeneralError(null);
    setFieldErrors({});
    setCurrentPassword('');
    setShowCurrentPassword(false);
    setIsDeleteExpanded(false);
    setDeletePassword('');
    setShowDeletePassword(false);
    setIsDeleting(false);

    try {
      const student = await fetchMe();
      const loaded: LoadedProfile = {
        name: student.name || '',
        email: student.email || '',
        phone: student.phone ? String(student.phone) : '',
        dob: student.dob ? String(student.dob).slice(0, 10) : '',
        gender: (student.gender as Gender) === 'أنثى' ? 'أنثى' : 'ذكر',
        major: student.major ? String(student.major) : '',
        academicLevel:
          student.academicLevel != null ? String(student.academicLevel) : '',
        studentId: student.studentId ? String(student.studentId) : '',
      };

      setName(loaded.name);
      setEmail(loaded.email);
      setPhone(loaded.phone);
      setDob(loaded.dob);
      setGender(loaded.gender);
      setMajor(loaded.major);
      setAcademicLevel(loaded.academicLevel);
      setStudentId(loaded.studentId);
      initialDataRef.current = loaded;
    } catch (err: any) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'تعذر تحميل بيانات الحساب، تأكد من الاتصال بالشبكة';
      setLoadError(msg);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadProfile();
    }
  }, [visible]);

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

    if (name.trim().length < 2) {
      errors.name = 'الاسم يجب أن يكون حرفين على الأقل';
    }

    if (!isValidEmail(email)) {
      errors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (isEmailChanged && !currentPassword.trim()) {
      errors.currentPassword = 'يرجى إدخال كلمة المرور الحالية لتأكيد تغيير البريد';
    }

    if (!isValidPhone(phone)) {
      errors.phone = 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
    }

    if (!isValidDob(dob)) {
      errors.dob = 'تاريخ الميلاد غير صالح أو في المستقبل (YYYY-MM-DD)';
    }

    if (!isValidAcademicLevel(academicLevel)) {
      errors.academicLevel = 'المستوى الدراسي يجب أن يكون بين 1 و 12';
    }

    if (!isValidStudentId(studentId)) {
      errors.studentId = 'الرقم الجامعي يجب أن يكون 5 خانات فأكثر';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      displayGeneralError('يرجى تصحيح الأخطاء الموضحة أدناه');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setGeneralError(null);

    if (!validateLocally()) {
      return;
    }

    const initial = initialDataRef.current;
    const patch: UpdateProfilePayload = {};

    if (initial) {
      if (name.trim() !== initial.name.trim()) {
        patch.name = name.trim();
      }
      if (email.trim() !== initial.email.trim()) {
        patch.email = email.trim();
        patch.currentPassword = currentPassword;
      }
      if (gender !== initial.gender) {
        patch.gender = gender;
      }
      if (phone.trim() !== initial.phone.trim()) {
        patch.phone = phone.trim();
      }
      if (dob.trim() !== initial.dob.trim()) {
        patch.dob = dob.trim();
      }
      if (major.trim() !== initial.major.trim()) {
        patch.major = major.trim();
      }
      if (academicLevel.trim() !== initial.academicLevel.trim()) {
        patch.academicLevel =
          academicLevel.trim() === '' ? '' : parseInt(academicLevel.trim(), 10);
      }
      if (studentId.trim() !== initial.studentId.trim()) {
        patch.studentId = studentId.trim();
      }
    }

    // If nothing changed, just close the modal without making a request
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(patch);
      onClose();
      setTimeout(() => {
        showDialog({
          variant: 'success',
          title: 'تم الحفظ',
        });
      }, 150);
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (
          err.code === 'CURRENT_PASSWORD_REQUIRED' ||
          err.code === 'WRONG_PASSWORD'
        ) {
          setFieldErrors((prev) => ({
            ...prev,
            currentPassword:
              err.message ||
              (err.code === 'WRONG_PASSWORD'
                ? 'كلمة المرور الحالية غير صحيحة'
                : 'كلمة المرور الحالية مطلوبة'),
          }));
          displayGeneralError(err.message);
        } else if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
          const newErrors: Record<string, string> = {};
          const unmapped: string[] = [];
          const validFields = [
            'name',
            'email',
            'gender',
            'studentId',
            'major',
            'academicLevel',
            'phone',
            'dob',
            'currentPassword',
          ];

          for (const item of err.errors) {
            if (item.field && validFields.includes(item.field)) {
              newErrors[item.field] = item.message;
            } else {
              unmapped.push(item.message || err.message);
            }
          }

          setFieldErrors(newErrors);
          if (unmapped.length > 0) {
            displayGeneralError(unmapped.join(' • '));
          } else {
            displayGeneralError('يرجى التحقق من صحة الحقول المدخلة');
          }
        } else {
          displayGeneralError(err.message);
        }
      } else {
        displayGeneralError('حدث خطأ غير متوقع');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setGeneralError(null);
    if (!deletePassword.trim()) {
      displayGeneralError('يرجى إدخال كلمة المرور لتأكيد حذف الحساب');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(deletePassword.trim());
      await clearToken();
      resetSchedule();
      setIsDeleteExpanded(false);
      setDeletePassword('');
      onClose();
      router.replace('/');
      setTimeout(() => {
        showDialog({
          variant: 'success',
          title: 'تم حذف الحساب بنجاح',
        });
      }, 150);
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.code === 'WRONG_PASSWORD') {
          displayGeneralError(err.message || 'كلمة المرور غير صحيحة');
        } else {
          displayGeneralError(err.message || 'تعذر حذف الحساب، حاول مرة أخرى');
        }
      } else {
        displayGeneralError('حدث خطأ غير متوقع أثناء حذف الحساب');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center border-b border-slate-100 px-5 pb-4 pt-2">
          <TouchableOpacity
            onPress={onClose}
            disabled={isSaving || isDeleting}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
          >
            <ArrowRight size={20} color="#475569" />
          </TouchableOpacity>
          <Text
            className="flex-1 text-center text-xl font-extrabold text-slate-900 mr-10"
            style={{ writingDirection: 'rtl' }}
          >
            تعديل معلومات الحساب
          </Text>
        </View>

        {isLoadingProfile ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : loadError ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-full mb-4 rounded-xl bg-red-50 border border-red-200 p-4">
              <Text
                style={{ textAlign: 'center', writingDirection: 'rtl' }}
                className="text-sm font-bold text-red-600 mb-3"
              >
                {loadError}
              </Text>
              <TouchableOpacity
                onPress={loadProfile}
                className="self-center rounded-xl bg-indigo-600 px-6 py-2.5"
              >
                <Text className="text-sm font-bold text-white">إعادة المحاولة</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            className="flex-1 px-6 pt-6"
            contentContainerStyle={{ paddingBottom: 100 }}
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

            {/* Name */}
            <View className="mb-4">
              <Text
                style={{
                  textAlign: 'left',
                  writingDirection: 'rtl',
                  width: '100%',
                }}
                className="mb-2 text-sm font-bold text-slate-700"
              >
                الاسم الكامل
              </Text>
              <TextInput
                editable={!isSaving}
                className={`rounded-xl border ${
                  fieldErrors.name ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 p-4 text-base text-slate-900`}
                style={{
                  textAlign: 'right',
                  writingDirection: 'rtl',
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                }}
                placeholder="أدخل اسمك الكامل"
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={(val) => {
                  handleFieldChange('name');
                  setName(val);
                }}
              />
              {!!fieldErrors.name && (
                <Text
                  style={{
                    textAlign: 'left',
                    writingDirection: 'rtl',
                    width: '100%',
                  }}
                  className="mt-1 text-xs text-red-500"
                >
                  {fieldErrors.name}
                </Text>
              )}
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text
                style={{
                  textAlign: 'left',
                  writingDirection: 'rtl',
                  width: '100%',
                }}
                className="mb-2 text-sm font-bold text-slate-700"
              >
                البريد الإلكتروني
              </Text>
              <TextInput
                editable={!isSaving}
                className={`rounded-xl border ${
                  fieldErrors.email ? 'border-red-500' : 'border-slate-200'
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
                  handleFieldChange('email');
                  setEmail(val);
                }}
              />
              {!!fieldErrors.email && (
                <Text
                  style={{
                    textAlign: 'left',
                    writingDirection: 'rtl',
                    width: '100%',
                  }}
                  className="mt-1 text-xs text-red-500"
                >
                  {fieldErrors.email}
                </Text>
              )}
            </View>

            {/* Current Password (if email changed) */}
            {isEmailChanged && (
              <View className="mb-4">
                <Text
                  style={{
                    textAlign: 'left',
                    writingDirection: 'rtl',
                    width: '100%',
                  }}
                  className="mb-2 text-sm font-bold text-slate-700"
                >
                  كلمة المرور الحالية <Text className="text-red-500">*</Text>
                </Text>
                <View
                  style={{
                    direction: 'ltr',
                    position: 'relative',
                    justifyContent: 'center',
                  }}
                >
                  <TextInput
                    editable={!isSaving}
                    className={`rounded-xl border ${
                      fieldErrors.currentPassword
                        ? 'border-red-500'
                        : 'border-slate-200'
                    } bg-slate-50 p-4 text-base text-slate-900`}
                    style={{
                      paddingLeft: 48,
                      paddingRight: 16,
                      textAlign: 'right',
                      writingDirection: 'rtl',
                      textAlignVertical: 'center',
                      includeFontPadding: false,
                    }}
                    placeholder="أدخل كلمة المرور الحالية لتأكيد التغيير"
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
            )}

            {/* Phone */}
            <View className="mb-4">
              <Text
                style={{
                  textAlign: 'left',
                  writingDirection: 'rtl',
                  width: '100%',
                }}
                className="mb-2 text-sm font-bold text-slate-700"
              >
                رقم الجوال
              </Text>
              <TextInput
                editable={!isSaving}
                className={`rounded-xl border ${
                  fieldErrors.phone ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 p-4 text-base text-slate-900`}
                style={{
                  textAlign: 'right',
                  writingDirection: 'rtl',
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                }}
                placeholder="05XXXXXXXX"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(val) => {
                  handleFieldChange('phone');
                  setPhone(val);
                }}
              />
              {!!fieldErrors.phone && (
                <Text
                  style={{
                    textAlign: 'left',
                    writingDirection: 'rtl',
                    width: '100%',
                  }}
                  className="mt-1 text-xs text-red-500"
                >
                  {fieldErrors.phone}
                </Text>
              )}
            </View>

            {/* Date of Birth */}
            <View className="mb-4">
              <Text
                style={{
                  textAlign: 'left',
                  writingDirection: 'rtl',
                  width: '100%',
                }}
                className="mb-2 text-sm font-bold text-slate-700"
              >
                تاريخ الميلاد
              </Text>
              <TextInput
                editable={!isSaving}
                className={`rounded-xl border ${
                  fieldErrors.dob ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 p-4 text-base text-slate-900`}
                style={{
                  textAlign: 'right',
                  writingDirection: 'rtl',
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#64748b"
                value={dob}
                onChangeText={(val) => {
                  handleFieldChange('dob');
                  setDob(val);
                }}
              />
              {!!fieldErrors.dob && (
                <Text
                  style={{
                    textAlign: 'left',
                    writingDirection: 'rtl',
                    width: '100%',
                  }}
                  className="mt-1 text-xs text-red-500"
                >
                  {fieldErrors.dob}
                </Text>
              )}
            </View>

            {/* Gender */}
            <View className="mb-4">
              <Text
                style={{
                  textAlign: 'left',
                  writingDirection: 'rtl',
                  width: '100%',
                }}
                className="mb-2 text-sm font-bold text-slate-700"
              >
                الجنس
              </Text>
              <View className="flex-row rounded-xl border border-slate-200 bg-slate-50 p-1">
                <TouchableOpacity
                  disabled={isSaving}
                  onPress={() => {
                    handleFieldChange('gender');
                    setGender('أنثى');
                  }}
                  className="flex-1 rounded-lg py-3 items-center"
                  style={[
                    gender === 'أنثى' && {
                      backgroundColor: 'white',
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      shadowOffset: { width: 0, height: 1 },
                    },
                  ]}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      writingDirection: 'rtl',
                      color: gender === 'أنثى' ? '#0f172a' : '#64748b',
                    }}
                    className="pb-1 font-bold"
                  >
                    أنثى
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={isSaving}
                  onPress={() => {
                    handleFieldChange('gender');
                    setGender('ذكر');
                  }}
                  className="flex-1 rounded-lg py-3 items-center"
                  style={[
                    gender === 'ذكر' && {
                      backgroundColor: 'white',
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      shadowOffset: { width: 0, height: 1 },
                    },
                  ]}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      writingDirection: 'rtl',
                      color: gender === 'ذكر' ? '#0f172a' : '#64748b',
                    }}
                    className="pb-1 font-bold"
                  >
                    ذكر
                  </Text>
                </TouchableOpacity>
              </View>
              {!!fieldErrors.gender && (
                <Text
                  style={{
                    textAlign: 'left',
                    writingDirection: 'rtl',
                    width: '100%',
                  }}
                  className="mt-1 text-xs text-red-500"
                >
                  {fieldErrors.gender}
                </Text>
              )}
            </View>

            {/* Major */}
            <View className="mb-4">
              <Text
                style={{
                  textAlign: 'left',
                  writingDirection: 'rtl',
                  width: '100%',
                }}
                className="mb-2 text-sm font-bold text-slate-700"
              >
                التخصص
              </Text>
              <TextInput
                editable={!isSaving}
                className={`rounded-xl border ${
                  fieldErrors.major ? 'border-red-500' : 'border-slate-200'
                } bg-slate-50 p-4 text-base text-slate-900`}
                style={{
                  textAlign: 'right',
                  writingDirection: 'rtl',
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                }}
                placeholder="أدخل تخصصك"
                placeholderTextColor="#64748b"
                value={major}
                onChangeText={(val) => {
                  handleFieldChange('major');
                  setMajor(val);
                }}
              />
              {!!fieldErrors.major && (
                <Text
                  style={{
                    textAlign: 'left',
                    writingDirection: 'rtl',
                    width: '100%',
                  }}
                  className="mt-1 text-xs text-red-500"
                >
                  {fieldErrors.major}
                </Text>
              )}
            </View>

            {/* Academic Level */}
            <View className="mb-4">
              <Text
                style={{
                  textAlign: 'left',
                  writingDirection: 'rtl',
                  width: '100%',
                }}
                className="mb-2 text-sm font-bold text-slate-700"
              >
                المستوى الدراسي
              </Text>
              <TextInput
                editable={!isSaving}
                className={`rounded-xl border ${
                  fieldErrors.academicLevel
                    ? 'border-red-500'
                    : 'border-slate-200'
                } bg-slate-50 p-4 text-base text-slate-900`}
                style={{
                  textAlign: 'right',
                  writingDirection: 'rtl',
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                }}
                placeholder="مثال: 3"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={academicLevel}
                onChangeText={(val) => {
                  handleFieldChange('academicLevel');
                  setAcademicLevel(val);
                }}
              />
              {!!fieldErrors.academicLevel && (
                <Text
                  style={{
                    textAlign: 'left',
                    writingDirection: 'rtl',
                    width: '100%',
                  }}
                  className="mt-1 text-xs text-red-500"
                >
                  {fieldErrors.academicLevel}
                </Text>
              )}
            </View>

            {/* Student ID */}
            <View className="mb-8">
              <Text
                style={{
                  textAlign: 'left',
                  writingDirection: 'rtl',
                  width: '100%',
                }}
                className="mb-2 text-sm font-bold text-slate-700"
              >
                الرقم الجامعي
              </Text>
              <TextInput
                editable={!isSaving}
                className={`rounded-xl border ${
                  fieldErrors.studentId
                    ? 'border-red-500'
                    : 'border-slate-200'
                } bg-slate-50 p-4 text-base text-slate-900`}
                style={{
                  textAlign: 'right',
                  writingDirection: 'rtl',
                  textAlignVertical: 'center',
                  includeFontPadding: false,
                }}
                placeholder="أدخل رقمك الجامعي"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={studentId}
                onChangeText={(val) => {
                  handleFieldChange('studentId');
                  setStudentId(val);
                }}
              />
              {!!fieldErrors.studentId && (
                <Text
                  style={{
                    textAlign: 'left',
                    writingDirection: 'rtl',
                    width: '100%',
                  }}
                  className="mt-1 text-xs text-red-500"
                >
                  {fieldErrors.studentId}
                </Text>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving || isDeleting}
              className={`mb-6 items-center justify-center rounded-2xl py-4 shadow-sm ${
                isSaving || isDeleting ? 'bg-indigo-400' : 'bg-indigo-600'
              }`}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{ textAlign: 'left' }}
                  className="pb-1 text-base font-bold text-white"
                >
                  حفظ التغييرات
                </Text>
              )}
            </TouchableOpacity>

            {/* Delete Account Section */}
            <View className="mb-12 rounded-2xl border border-red-200 bg-red-50/60 p-5">
              <Text
                style={{ textAlign: 'left', writingDirection: 'rtl' }}
                className="mb-1 text-base font-bold text-red-700"
              >
                حذف الحساب
              </Text>

              {!isDeleteExpanded ? (
                <>
                  <Text
                    style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 22 }}
                    className="mb-4 text-xs text-red-600/90"
                  >
                    سيُحذف حسابك وكل مقرراتك وجداولك نهائياً ولا يمكن التراجع
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsDeleteExpanded(true);
                      setGeneralError(null);
                    }}
                    disabled={isSaving || isDeleting}
                    className="items-center justify-center rounded-xl border border-red-300 bg-white py-3 shadow-xs"
                  >
                    <Text
                      style={{ textAlign: 'center' }}
                      className="pb-0.5 text-sm font-bold text-red-600"
                    >
                      حذف حسابي
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View className="mt-2">
                  <Text
                    style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 22 }}
                    className="mb-4 text-xs font-semibold text-red-600"
                  >
                    سيُحذف حسابك وكل مقرراتك وجداولك نهائياً ولا يمكن التراجع
                  </Text>

                  <View className="mb-4">
                    <Text
                      style={{ textAlign: 'left', writingDirection: 'rtl' }}
                      className="mb-2 text-xs font-bold text-slate-700"
                    >
                      كلمة المرور لتأكيد الحذف
                    </Text>
                    <View
                      style={{
                        direction: 'ltr',
                        position: 'relative',
                        justifyContent: 'center',
                      }}
                    >
                      <TextInput
                        editable={!isSaving && !isDeleting}
                        className="rounded-xl border border-red-200 bg-white p-3.5 text-base text-slate-900"
                        style={{
                          paddingLeft: 44,
                          paddingRight: 14,
                          textAlign: 'right',
                          writingDirection: 'rtl',
                          textAlignVertical: 'center',
                          includeFontPadding: false,
                        }}
                        placeholder="أدخل كلمة المرور الحالية"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry={!showDeletePassword}
                        value={deletePassword}
                        onChangeText={(val) => {
                          setDeletePassword(val);
                          if (generalError) setGeneralError(null);
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => setShowDeletePassword(!showDeletePassword)}
                        style={{
                          position: 'absolute',
                          left: 10,
                          zIndex: 20,
                          padding: 4,
                        }}
                        activeOpacity={0.7}
                        disabled={isSaving || isDeleting}
                      >
                        {showDeletePassword ? (
                          <EyeOff color="#64748b" size={20} />
                        ) : (
                          <Eye color="#64748b" size={20} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={handleDeleteAccount}
                      disabled={isSaving || isDeleting}
                      className="flex-1 items-center justify-center rounded-xl bg-red-600 py-3 shadow-xs"
                    >
                      {isDeleting ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text
                          style={{ textAlign: 'center' }}
                          className="pb-0.5 text-sm font-bold text-white"
                        >
                          تأكيد حذف الحساب
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setIsDeleteExpanded(false);
                        setDeletePassword('');
                        if (generalError) setGeneralError(null);
                      }}
                      disabled={isSaving || isDeleting}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 items-center justify-center"
                    >
                      <Text
                        style={{ textAlign: 'center' }}
                        className="pb-0.5 text-sm font-bold text-slate-600"
                      >
                        إلغاء
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}
