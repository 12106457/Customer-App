import React, { useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';

type PaymentParams = {
  paymentLink: string;
  orderId: string;
};

type VerifyResponse = {
  status: boolean;
  message: string;
  order?: any;
};

const PaymentScreen = () => {
  const { paymentLink, orderId } = useLocalSearchParams<PaymentParams>();

  // Open Cashfree payment page using modal browser
  useEffect(() => {
    const openPayment = async () => {
      if (!paymentLink || !orderId) return;

      const redirectUrl = Linking.createURL('payment/status'); // e.g. myapp://payment/status

      try {
        const result = await WebBrowser.openAuthSessionAsync(paymentLink, redirectUrl);

        if (result.type === 'success' || result.type === 'dismiss') {
          verifyPayment(orderId);
        }
      } catch (error) {
        console.error('Error opening payment modal:', error);
        Alert.alert('Error', 'Failed to open payment window.');
      }
    };

    openPayment();
  }, [paymentLink, orderId]);

  // Fallback deep link handler
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (url.startsWith('myapp://payment/status')) {
        await WebBrowser.dismissBrowser(); // Close browser
        if (orderId) {
          verifyPayment(orderId);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [orderId]);

  // Verify payment from backend
  const verifyPayment = async (orderId: string) => {
    try {
      const response = await fetch('https://cashfree-payment-gateway.vercel.app/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });

      const result: VerifyResponse = await response.json();

      if (result.status) {
        Alert.alert('Payment Success', 'Your payment has been confirmed!');
      } else {
        Alert.alert('Payment Failed', result.message || 'Unable to confirm payment.');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      Alert.alert('Error', 'Failed to verify payment.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default PaymentScreen;
