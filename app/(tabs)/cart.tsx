import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/cartContent';
import { CartItem, CartProductType } from '@/models/common';
import QuantitySelector from '@/components/ui/quantitySelector';
import  ProductDisplayContainer from "@/components/productDisplayContainer"
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';
import { AntDesign } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {addToCart,getCart, resetCart} from "@/utility/cartFunctions"
import HeaderDropdown from '@/components/ui/headerDropdownSelect';
import { useSpinner } from '@/context/spinnerContext';
import { useProfileData } from '@/context/userProfileContent';

const Cart = () => {
  const { cartData, setCartData } = useCart();
  const [donate, setDonate] = useState(false);
  const [cartProductData,setcartProductData]=useState<CartProductType[]>([])
  const [IsModelVisible,setIsModelVisible]=useState(false)
  const [selectedProductId,setSelectProductId]=useState("");
  const [delivaryType, setDelivaryType] = useState("Delivery");
  const [buyingShopId,setBuyingShopId]=useState("");
  const {loading,setLoading}=useSpinner() 
  const {userData}=useProfileData()


  const deliveryCost = delivaryType==="Delivery"? 30 : 0;
  const discount = 20;
  const donationAmount = donate ? 10 : 0;
  const [address,setAddress]=useState("");
  const [formatedAddress,setFormatedAddress]=useState<any>({});
  const route=useRouter();
  useEffect(()=>{
    
    if(cartData.length>0){
      setcartProductData([...cartData]);
      setBuyingShopId(cartData[0]?.productId?.shopId)
    }

  },[cartData])

  const productCost = cartProductData.reduce((acc, item) => acc + item.totalAmount, 0);
  const totalAmount = productCost + deliveryCost - discount + donationAmount;

  useFocusEffect(
    useCallback(() => {
      console.log("cartdata from cart page:",cartProductData);
      const fetchAddress = async () => {
        try {
          const storedAddress = await AsyncStorage.getItem('userCoordinates');
          if (storedAddress) {
            const parsed = JSON.parse(storedAddress);
            setAddress(parsed?.displayAddress || '');
            console.log("Address:", parsed?.displayAddress);
            setFormatedAddress(parsed?.address||{})
          }
        } catch (error) {
          console.error("Error fetching address:", error);
        }
      };
  
      fetchAddress();
    }, [cartProductData])
  );

  const handleOrder= async ()=>{
    try{
       setLoading(true);
       const response=await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/order/create`,
        {
          method:"POST",
          headers: {
            "Content-Type": "application/json",
          },
          body:JSON.stringify({
            "sellerId":buyingShopId||"",
            "customerId":userData?._id,
            "products":cartData,
            "totalOrderAmount":totalAmount,
            "paymentMethod":"cash_on_delivery",
            "orderType": delivaryType==="Delivery"?"Cash_On_Delivery":"Take_A_Way",
            "shippingAddress":{
              street: formatedAddress?.street || '',
              city: formatedAddress?.city || '',
              state: formatedAddress?.state || '',
              country: formatedAddress?.country || '',
              pinCode: formatedAddress?.pinCode || '',
            }
          })
        }
       )

       const data=await response.json();
       console.log("order creation response :",data);
       if(data.success){
        setCartData([]);
        setBuyingShopId("");
        await resetCart()
        route.push("/(tabs)/orders?refetch=true");
       }
    }catch(error:any){
      console.log("error at addtocart api :",error);
    }finally{
      setLoading(false);
    }
  }



  const startPayment = async () => {
    try {
      const res = await fetch('https://cashfree-payment-gateway.vercel.app/payment',
        {
          method:"GET",
          headers:{
           "Content-Type": "application/json",
          }
        }
      );
      const data = await res.json();


      if(data.status){
        // assuming backend responds with a `payment_link`
        const paymentUrl = data.data.paymentLink || data.data.payment_url;
        const orderId=data.data.orderId
        route.push(`/commonRoute/cashfreePaymentPage?paymentLink=${encodeURIComponent(paymentUrl)}&&orderId=${orderId}`);

      }else{
        Alert.alert("Somewent wrong while doing payment")
      }

    } catch (err) {
      console.error('Payment Error:', err);
    }
  };

  const renderItem = ({ item }: { item: CartProductType }) => {
    // Log the item to console
    console.log('Rendering item:', item);
  
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => {setSelectProductId(item.productId._id); setTimeout(() => setIsModelVisible(true), 50);}}>
          <Image source={{ uri: item.productId.prodId.image }} style={styles.itemImage} />
        </TouchableOpacity>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.productId.prodId.name}</Text>
          <Text style={styles.itemPrice}>₹{item.productId.price} X {item.quantity}</Text>
          <View style={styles.quantityContainer}>
            <QuantitySelector ProductQuantity={item.quantity} productDetails={item.productId} />
          </View>
        </View>
        <View style={styles.itemTotal}>
          <Text style={styles.itemTotalText}>₹{item.totalAmount}</Text>
        </View>
      </View>
    );
  };
  

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Product Cost</Text>
        <Text style={styles.summaryValue}>₹{productCost}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Delivery Charges</Text>
        <Text style={styles.summaryValue}>₹{deliveryCost}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Discount</Text>
        <Text style={styles.summaryValue}>−₹{discount}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Donate for Food</Text>
        {donate ? (
          <TouchableOpacity onPress={() => setDonate(false)}>
           <Text style={styles.summaryValue}>+₹10</Text>
          </TouchableOpacity>
          // <Text style={styles.summaryValue}>+₹10</Text>
        ) : (
          <TouchableOpacity onPress={() => setDonate(true)}>
            <Text style={styles.donateBtn}>+ Add ₹10</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { fontWeight: 'bold' }]}>Total Payable</Text>
        <Text style={[styles.summaryValue, { fontWeight: 'bold' }]}>₹{totalAmount}</Text>
      </View>
    </View>
  );

  return (
    <>
    <Stack.Screen
      name="cart"
      options={{
        headerShown: true,
        headerTitle: "Cart",
        headerRight: () => <HeaderDropdown optionList={["Delivery", "Takeaway"]} selectedOption={delivaryType} setSelectOption={setDelivaryType}/>,
      }}
    />
    <View style={styles.container}>
      {cartData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartProductData}
            renderItem={renderItem}
            keyExtractor={(item) => item.productId._id}
            ListFooterComponent={renderSummary}
            contentContainerStyle={{ paddingBottom: 220 }}
          />
          <TouchableOpacity style={styles.addressBar} onPress={()=>route.push("/commonRoute/SelectAddress")}>
            <View style={{ flexDirection: 'row', width: '100%' }}>
             
              {
                address===""?
                <View style={{ flex: 10,justifyContent:"center",alignItems:"flex-start" }}>
                  <Text style={{ color: '#374151', fontSize: 15, fontWeight: '500' }}>Select Address:</Text>
                </View>
                :
                <View style={{ flex: 10 }}>
                <Text style={{ color: '#6B7280', fontSize: 13, marginBottom: 4 }}>
                  Delivering to:
                </Text>
                  <Text style={{ color: '#374151', fontSize: 15, fontWeight: '500' }}
                  numberOfLines={1}
                  ellipsizeMode="tail" >
                    {address}
                  </Text>
                </View>
              }

              {/* 2 columns (icon or button) */}
              <View style={{ flex: 2, alignItems: 'flex-end',justifyContent:"center" }}>
               
                  <AntDesign name="right" size={24} color="black" />
                
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>₹{totalAmount}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={()=>handleOrder()}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ProductDisplayContainer visible={IsModelVisible} onClose={setIsModelVisible} productId={selectedProductId} />

    </View>
    </>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 60,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    width:100
  },
  qtyButton: {
    backgroundColor: '#eee',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  itemTotal: {
    marginLeft: 10,
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopColor: '#eee',
    borderTopWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  totalLabel: {
    fontSize: 14,
    color: '#555',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  checkoutButton: {
    backgroundColor: '#1ba672',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
  summaryContainer: {
    marginTop:20,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderTopColor: '#eee',
    borderTopWidth: 4,
    borderStyle:"dotted"
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
  },
  donateBtn: {
    color: '#1ba672',
    fontSize: 14,
    fontWeight: '600',
  },
  addressBar:{
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  addressText:{
    color:"white"
  }

});




