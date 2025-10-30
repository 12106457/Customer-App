import { Button, StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import ToastManager, { Toast } from "toastify-react-native";

const Orders = () => {
  const route = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const manuallyDisconnected = useRef(false);

  const connectWebSocket = () => {
    if (socket.current) return;

    setLoading(true);
    const url = `wss://${process.env.EXPO_PUBLIC_WEB_SOCKET_URL}67ed0623767d480a2fa262b1`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("Connected to WebSocket ✅");
      setLoading(false);
      setIsOnline(true);
      manuallyDisconnected.current = false;
      Toast.success("Online");

      ws.send(JSON.stringify({
        type: "fetch_orders",
        shopId: "67ed0623767d480a2fa262b1"
      }));
    };

    ws.onmessage = (event) => {
      // console.log("event:",event);
      if (!event.data) return;

      try {
        const data = JSON.parse(event.data);
        // console.log("websocket data:",data);
        if (data.type === "customer_orders") {
          // console.log("data:",data);
          setOrders(data.orders || []);
          // Toast.success("Orders Updated ✅");
        } else if (data.type === "order_received") {
           console.log("order received:",data);
          setOrders((prev) => [data.order, ...prev]);
          Toast.success("New Order Received ✅");
        } else if (data.type === "order_update") {
          setOrders((prev) =>
            prev.map((order) =>
              order._id === data.orderData._id
                ? { ...order, ...data.orderData }
                : order
            )
          );
        } else if (data.type === "no_orders") {
          Toast.info("No Orders Today");
        } else if (data.type === "error") {
          Toast.error(data.message);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected ❌");
      socket.current = null;
      setIsOnline(false);
      setLoading(false);
      // Toast.info("Offline");

      if (!manuallyDisconnected.current) {
        reconnectWebSocket();
      }
    };

    socket.current = ws;
  };

  const disconnectWebSocket = () => {
    manuallyDisconnected.current = true;
    if (socket.current) {
      socket.current.close();
      socket.current = null;
      Toast.info("Offline");
    }
  };

  const reconnectWebSocket = () => {
    setTimeout(() => {
      console.log("Reconnecting WebSocket...");
      connectWebSocket();
    }, 5000);
  };

  const toggleConnection = (value: boolean) => {
    if (value && !socket.current) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }
  };

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const url=`${process.env.EXPO_PUBLIC_API_BASE_URL}/order/customer/67ed0623767d480a2fa262b1`;
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      setOrders(data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Toast.error("Error fetching all orders");
      console.error(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log("Screen focused, connecting socket...");
      connectWebSocket();
  
      return () => {
        console.log("Screen unfocused, disconnecting socket...");
        manuallyDisconnected.current = true;
        if (socket.current) {
          socket.current.close();
          socket.current = null;
        }
      };
    }, [])
  );
  

  return (
    <View style={styles.container}>
      <ToastManager />
      <Text style={styles.heading}>Orders</Text>
      <Button title="All Orders" onPress={fetchAllOrders} />

      <ScrollView style={styles.orderList}>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          orders.map((order) => (
            <View key={order._id} style={styles.orderItem}>
              <Text>{order.customerId?.name}</Text>
              <Text>
                {order.items?.map((item: any) => item.productId?.name).join(', ')}
              </Text>
              <Text>Total: ${order.totalOrderAmount}</Text>
              <Text>Status:{order.status}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderList: {
    marginTop: 20,
  },
  orderItem: {
    padding: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Orders;
