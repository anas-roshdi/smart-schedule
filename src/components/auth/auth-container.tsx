import React, { useState } from 'react';
import { View } from 'react-native';
import { Login } from './login';
import { Register } from './register';
import { ForgotPassword } from './forgot-password';
import { VerifyCode } from './verify-code';
import { ResetPassword } from './reset-password';

export type AuthView =
  | 'login'
  | 'register'
  | 'forgot'
  | 'verify-code'
  | 'reset-password';

interface AuthContainerProps {
  onAuthSuccess: () => void;
}

export function AuthContainer({ onAuthSuccess }: AuthContainerProps) {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [forgotErrorMessage, setForgotErrorMessage] = useState<string | null>(null);

  const handleNavigate = (view: AuthView) => {
    if (view === 'login') {
      setResetEmail('');
      setResetToken('');
      setForgotErrorMessage(null);
    }
    setCurrentView(view);
  };

  const handleEmailSent = (email: string) => {
    setResetEmail(email);
    setForgotErrorMessage(null);
    setCurrentView('verify-code');
  };

  const handleCodeVerified = (token: string) => {
    setResetToken(token);
    setCurrentView('reset-password');
  };

  const handleSessionExpired = () => {
    setResetEmail('');
    setResetToken('');
    setForgotErrorMessage('انتهت صلاحية العملية، ابدأ من جديد');
    setCurrentView('forgot');
  };

  const handleResetComplete = () => {
    setResetEmail('');
    setResetToken('');
    setForgotErrorMessage(null);
    setCurrentView('login');
  };

  return (
    <View className="flex-1 bg-white">
      {currentView === 'login' && (
        <Login onNavigate={handleNavigate} onAuthSuccess={onAuthSuccess} />
      )}
      {currentView === 'register' && (
        <Register onNavigate={handleNavigate} onAuthSuccess={onAuthSuccess} />
      )}
      {currentView === 'forgot' && (
        <ForgotPassword
          onNavigate={handleNavigate}
          onEmailSent={handleEmailSent}
          errorMessage={forgotErrorMessage}
          onClearErrorMessage={() => setForgotErrorMessage(null)}
        />
      )}
      {currentView === 'verify-code' && (
        <VerifyCode
          onNavigate={handleNavigate}
          resetEmail={resetEmail}
          onCodeVerified={handleCodeVerified}
        />
      )}
      {currentView === 'reset-password' && (
        <ResetPassword
          onNavigate={handleNavigate}
          onAuthSuccess={onAuthSuccess}
          resetToken={resetToken}
          onResetComplete={handleResetComplete}
          onSessionExpired={handleSessionExpired}
        />
      )}
    </View>
  );
}
