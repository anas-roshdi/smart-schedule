import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { AuthContainer } from '../components/auth/auth-container';
import { ApiError, setUnauthorizedHandler } from '../lib/api';
import { fetchMe } from '../lib/auth';
import { clearToken, getToken } from '../lib/token-storage';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      router.replace('/');
    });

    async function checkAuth() {
      try {
        const token = await getToken();
        if (!token) {
          setIsChecking(false);
          return;
        }

        await fetchMe();
        router.replace('/(main)/schedule-planner');
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearToken();
        }
        setIsChecking(false);
      }
    }

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    router.replace('/(main)/schedule-planner');
  };

  if (isChecking) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AuthContainer onAuthSuccess={handleAuthSuccess} />
    </View>
  );
}
