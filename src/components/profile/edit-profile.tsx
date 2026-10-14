import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';

type Gender = 'أنثى' | 'ذكر';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  // Pre-fill with dummy data
  const [name, setName] = useState('أنس الطالب');
  const [email, setEmail] = useState('a7nas.talika@student.edu.sa');
  const [phone, setPhone] = useState('0512345678');
  const [dob, setDob] = useState('2000-01-01');
  const [gender, setGender] = useState<Gender>('ذكر');
  const [major, setMajor] = useState('علوم الحاسب');
  const [academicLevel, setAcademicLevel] = useState('5');
  const [studentId, setStudentId] = useState('441123456');

  const handleSave = () => {
    // Save logic
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center border-b border-slate-100 px-5 pb-4 pt-2">
          <TouchableOpacity onPress={onClose} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50">
            <ArrowRight size={20} color="#475569" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-extrabold text-slate-900 mr-10" style={{ writingDirection: 'rtl' }}>
            تعديل معلومات الحساب
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="mb-4">
            <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
              الاسم الكامل
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
              البريد الإلكتروني
            </Text>
            <TextInput
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900"
              style={{ textAlign: 'right', writingDirection: 'rtl', textAlignVertical: 'center', includeFontPadding: false }}
              placeholder="example@student.edu.sa"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
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
              الجنس
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

          <TouchableOpacity
            onPress={handleSave}
            className="mb-12 items-center justify-center rounded-2xl bg-indigo-600 py-4 shadow-sm"
          >
            <Text style={{ textAlign: 'left' }} className="pb-1 text-base font-bold text-white">
              حفظ التغييرات
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
