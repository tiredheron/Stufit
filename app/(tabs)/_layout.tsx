import { Redirect, Tabs } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import CustomTabBar from '@/components/CustomTabBar';

export default function TabsLayout() {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await new Promise(res => setTimeout(res, 300));

        const token = await AsyncStorage.getItem('auth_token');
        setLoggedIn(!!token);
      } catch (e) {
        console.warn('Storage error:', e);
        setLoggedIn(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!loggedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" }, // 기본 탭바 숨기기!
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="plan" />
        <Tabs.Screen name="chatbot" />
        <Tabs.Screen name="metric" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <CustomTabBar/>
    </>
  );
}
