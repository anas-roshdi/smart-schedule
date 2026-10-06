import { ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { AuthView } from './auth-container';

interface ResetPasswordProps {
  onNavigate: (view: AuthView) => void;
  onAuthSuccess: () => void;
}

export function ResetPassword({ onNavigate, onAuthSuccess }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleReset = () => {
    if (password && password === confirmPassword) {
      setShowSuccessModal(true);
    }
  };

  return (
    <View className="flex-1 px-6 pt-12">
      <TouchableOpacity onPress={() => onNavigate('verify-code')} className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 mb-6">
        <ArrowRight size={20} color="#475569" />
      </TouchableOpacity>

      <View className="flex-1 justify-center pb-20">
        <Text style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 42 }} className="mb-8 pb-1 text-3xl font-extrabold text-slate-900 text-center">
          إعداد كلمة مرور جديدة
        </Text>

        <View className="mb-4">
          <Text style={{ textAlign: 'left', writingDirection: 'rtl', width: '100%' }} className="mb-2 text-sm font-bold text-slate-700">
            كلمة المرور الجديدة <Text className="text-red-500">*</Text>
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
            تأكيد كلمة المرور الجديدة <Text className="text-red-500">*</Text>
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

        <TouchableOpacity
          onPress={handleReset}
          className="mb-6 items-center justify-center rounded-2xl bg-indigo-600 py-4 shadow-sm"
        >
          <Text style={{ textAlign: 'left' }} className="pb-1 text-base font-bold text-white">
            حفظ
          </Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-6 w-full items-center shadow-lg">
            <CheckCircle2 color="#22c55e" size={64} className="mb-4" />
            <Text style={{ textAlign: 'center', writingDirection: 'rtl', lineHeight: 32 }} className="text-xl font-extrabold text-slate-900 mb-6 text-center">
              تم تغيير كلمة المرور بنجاح
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                onNavigate('login');
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
