import React, { useState } from 'react';
import { View } from 'react-native';
import { Login } from './login';
import { Register } from './register';
import { ForgotPassword } from './forgot-password';
import { VerifyCode } from './verify-code';
import { ResetPassword } from './reset-password';

export type AuthView = 'login' | 'register' | 'forgot' | 'verify-code' | 'reset-password';

interface AuthContainerProps {
  onAuthSuccess: () => void;
}

export function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  return (
    <View className="flex-1 bg-white">
      {currentView === 'login' && <Login onNavigate={setCurrentView} onAuthSuccess={onAuthSuccess} />}
      {currentView === 'register' && <Register onNavigate={setCurrentView} onAuthSuccess={onAuthSuccess} />}
      {currentView === 'forgot' && <ForgotPassword onNavigate={setCurrentView} />}
      {currentView === 'verify-code' && <VerifyCode onNavigate={setCurrentView} />}
      {currentView === 'reset-password' && <ResetPassword onNavigate={setCurrentView} onAuthSuccess={onAuthSuccess} />}
    </View>
  );
}
