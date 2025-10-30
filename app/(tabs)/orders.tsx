import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import ToastManager, { Toast } from "toastify-react-native";
import { OrderDataItem, OrderItem } from '@/models/orderModel';
import { Skeleton } from 'moti/skeleton';
import { useLocalSearchParams } from 'expo-router';
import { useProfileData } from '@/context/userProfileContent';

const Orders = () => {
  const [orders, setOrders] = useState<OrderDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const {authToken,userData}=useProfileData()
  const {refetch} = useLocalSearchParams<any>();

  useEffect(()=>{
    if(refetch){
      fetchAllOrders();
    }
  },[refetch]);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/order/customer/${userData?._id}`;
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data.data || []);
    } catch (error) {
      Toast.error("Error fetching all orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAllOrders();
    }, [])
  );

  return (
    <View style={styles.container}>
      <ToastManager />

      {loading ? (
        <ScrollView style={styles.orderList} showsVerticalScrollIndicator={false} scrollEnabled={false}>
          {[...Array(5)].map((_, index) => (
            <View key={index} style={styles.card}>
              {/* Skeleton for horizontal product images */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productScroll}
              >
                <View style={styles.productChip}>
                  <Skeleton colorMode="light" height={40} width={40} radius={8} />
                </View>
                <View style={styles.productChip}>
                  <Skeleton colorMode="light" height={40} width={40} radius={8} />
                </View>
              </ScrollView>

              {/* Skeleton for Order Status */}
              <View style={styles.status}>
                <Skeleton colorMode="light" height={20} width={150} radius={4} />
              </View>

              {/* Skeleton for Date and Amount */}
              <View style={styles.row}>
                <View >
                  <Skeleton colorMode="light" height={15} width={170} radius={4} />
                </View>
                <View >
                  <Skeleton colorMode="light" height={20} width={60} radius={4} />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={styles.orderList}>
          {orders.map((order) => (
            <View key={order._id} style={styles.card}>
              {/* Product list */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productScroll}
              >
                {order.items?.map((item: OrderItem, index: number) => (
                  <View key={index} style={styles.productChip}>
                    {item.productId?.prodId?.image ? (
                      <Image
                        source={{ uri: item.productId.prodId.image }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.productName}>No Image</Text>
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Order status */}
              <Text style={styles.status}>
                Status: {order.status || "Unknown"}
              </Text>

              {/* Date and amount */}
              <View style={styles.row}>
                <Text style={styles.date}>
                  {new Date(order.estimatedDelivery).toLocaleString()}
                </Text>
                <Text style={styles.amount}>
                  ₹ {order.totalOrderAmount}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flex: 1,
    backgroundColor: '#fff',
  },
  orderList: {
    marginTop: 0,
  },
  card: {
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    elevation: 2,
  },
  productScroll: {
    flexDirection: 'row',
    gap: 10,
  },
  productChip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  status: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
  },
  row: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 13,
    color: '#555',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Orders;
