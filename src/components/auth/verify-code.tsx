import { ArrowRight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ApiError } from '../../lib/api';
import { requestPasswordReset, verifyResetCode } from '../../lib/auth';
import type { AuthView } from './auth-container';

interface VerifyCodeProps {
  onNavigate: (view: AuthView) => void;
  resetEmail: string;
  onCodeVerified: (token: string) => void;
}

export function VerifyCode({
  onNavigate,
  resetEmail,
  onCodeVerified,
}: VerifyCodeProps) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleVerify = async () => {
    if (code.length < 4) {
      setCodeError('يرجى إدخال الرمز المكون من 4 أرقام');
      return;
    }

    setIsVerifying(true);
    setCodeError('');
    setGeneralError('');
    setSuccessMessage('');

    try {
      const resetToken = await verifyResetCode(resetEmail, code);
      onCodeVerified(resetToken);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'INVALID_CODE' || error.status === 400) {
          setCodeError(error.message);
          setCode('');
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError('حدث خطأ غير متوقع');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending || isVerifying) return;

    setIsResending(true);
    setCodeError('');
    setGeneralError('');
    setSuccessMessage('');

    try {
      await requestPasswordReset(resetEmail);
      setSuccessMessage('تم إرسال رمز جديد');
      setCountdown(60);
    } catch (error) {
      if (error instanceof ApiError) {
        setGeneralError(error.message);
      } else {
        setGeneralError('حدث خطأ غير متوقع');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View className="flex-1 px-6 pt-12">
      <TouchableOpacity
        onPress={() => onNavigate('forgot')}
        disabled={isVerifying || isResending}
        className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 mb-6"
      >
        <ArrowRight size={20} color="#475569" />
      </TouchableOpacity>

      <View className="flex-1 justify-center pb-20">
        <Text
          style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 32 }}
          className="mb-4 pb-1 text-3xl font-extrabold text-slate-900 text-center"
        >
          أدخل الرمز
        </Text>
        <Text
          style={{ textAlign: 'left', writingDirection: 'rtl', lineHeight: 24 }}
          className="mb-8 text-sm text-slate-500 text-center px-4"
        >
          أدخل الرمز المكون من 4 أرقام المرسل إلى بريدك
        </Text>

        {/* Success Banner */}
        {!!successMessage && (
          <View className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
            <Text
              style={{ textAlign: 'center', writingDirection: 'rtl' }}
              className="text-sm font-bold text-emerald-700"
            >
              {successMessage}
            </Text>
          </View>
        )}

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

        <TextInput
          editable={!isVerifying && !isResending}
          className={`rounded-xl border ${
            codeError ? 'border-red-500' : 'border-slate-200'
          } bg-slate-50 p-4 pb-1 text-3xl font-bold text-slate-900 text-center tracking-widest ${
            codeError ? 'mb-2' : 'mb-8'
          }`}
          style={{
            includeFontPadding: false,
            textAlignVertical: 'center',
            lineHeight: 36,
          }}
          placeholder="0000"
          placeholderTextColor="#cbd5e1"
          keyboardType="numeric"
          maxLength={4}
          value={code}
          onChangeText={(val) => {
            setCode(val);
            if (codeError) setCodeError('');
            if (generalError) setGeneralError('');
          }}
        />

        {!!codeError && (
          <Text
            style={{ textAlign: 'center', writingDirection: 'rtl' }}
            className="mb-6 text-xs text-red-500"
          >
            {codeError}
          </Text>
        )}

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={isVerifying || isResending}
          className={`mb-4 items-center justify-center rounded-2xl py-4 shadow-sm ${
            isVerifying || isResending ? 'bg-indigo-400' : 'bg-indigo-600'
          }`}
        >
          {isVerifying ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{ textAlign: 'left' }}
              className="pb-1 text-base font-bold text-white"
            >
              تحقق
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend Code Button */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={countdown > 0 || isResending || isVerifying}
          className="items-center justify-center py-2"
        >
          {isResending ? (
            <ActivityIndicator size="small" color="#4f46e5" />
          ) : countdown > 0 ? (
            <Text
              style={{ textAlign: 'center', writingDirection: 'rtl' }}
              className="text-sm font-medium text-slate-400"
            >
              {`إعادة إرسال الرمز بعد ${countdown} ثانية`}
            </Text>
          ) : (
            <Text
              style={{ textAlign: 'center', writingDirection: 'rtl' }}
              className="text-sm font-bold text-indigo-600"
            >
              إعادة إرسال الرمز
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
