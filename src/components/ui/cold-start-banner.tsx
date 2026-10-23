import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribeColdStart } from '../../lib/api';

export function ColdStartBanner() {
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = subscribeColdStart((isColdStarting) => {
      setVisible(isColdStarting);
    });
    return unsubscribe;
  }, []);

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        { top: Math.max(insets.top, 12) + 8 },
      ]}
    >
      <View style={styles.card}>
        <ActivityIndicator size="small" color="#4f46e5" />
        <Text style={styles.text}>
          جارٍ إيقاظ الخادم، قد يستغرق حتى دقيقة...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#c7d2fe',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    gap: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#312e81',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
