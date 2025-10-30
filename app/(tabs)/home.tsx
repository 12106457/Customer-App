import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import Container, { Toast } from "toastify-react-native";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";
import ProductDisplayModel from "@/components/productDisplayContainer"
import { useCart } from "@/context/cartContent";
import QuantitySelector from "@/components/ui/quantitySelector";
import {CartItem, CartProductType} from "@/models/common"
import AsyncStorage from '@react-native-async-storage/async-storage';
import {addToCart,getCart} from "@/utility/cartFunctions"
import { useRouter } from "expo-router";
import { useConfirmationModal } from "@/components/customHook/useConfirmationModel";
import { Skeleton } from 'moti/skeleton';
const HEADER_HEIGHT = 60;

type Product = {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
  prodId: {
    _id: string;
    name: string;
    image: string;
  };
  shopId: string;
};

type ShopDataType = {
  _id: string;
  name: string;
  shopAddress: string;
  shopImage: string;
  rating: number;
  products: Product[];
  distance: number;
};


const Dashboard: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [shopDataNearByRadius, setShopDataNearByRadius] = useState<ShopDataType[]>([]);
  const [searchText,setSearchText]=useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isModelOpen,setIsModelOpen]=useState(false);
  const [productId,setProductId]=useState<string>("");
  const {cartData,setCartData}=useCart();
  const {ConfirmationModal,showConfirmation}=useConfirmationModal()
  const router=useRouter();
  const onRefresh = async () => {
    setRefreshing(true);
    // if (coordinates) {
    //   await fetchShopProducts(coordinates.latitude, coordinates.longitude);
    // }
    // FetchCartProducts()
    const result=await getCart();
    // console.log("refresh cart data:",result);
    setCartData(result);
    setLoading(true);
    getLocation();

    setRefreshing(false);
  };

  const filteredShops = shopDataNearByRadius.filter((shop) =>
    shop.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  

  useEffect(() => {
    const fetchCartDetails=async()=>{
      const result=await getCart();
    // console.log("refresh cart data:",result);
    setCartData(result);
    }
    setLoading(true);
    fetchCartDetails();
    getLocation();
    // FetchCartProducts();
  }, []);

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      console.log("Latitude:", location.coords.latitude, "Longitude:", location.coords.longitude);
      setCoordinates({ latitude: location.coords.latitude, longitude: location.coords.longitude });

      fetchAddress(location.coords.latitude, location.coords.longitude);
      fetchShopProducts(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error("Error getting location:", error);
      setErrorMsg("Failed to get location");
      setLoading(false);
    }
  };

  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&timestamp=${Date.now()}`,
        {
          headers: {
            "User-Agent": "smartmart/1.0 (smartMart@email.com)",
          },
        }
      );

      const data = await response.json();
      console.log("address:",data);
      setAddress(data.display_name);


      const address = data.address;

      // Dynamically build the street from available fields
      const streetParts = [
        address.house_number,
        address.road,
        address.suburb,
      ];
      const street = streetParts.filter(Boolean).join(", ");

      // Use fallback for city
      const city = address.city || address.town || address.village || "";

      // Final formatted object
      const formattedAddress = {
        ...(street && { street }),
        ...(city && { city }),
        ...(address.state && { state: address.state }),
        ...(address.country && { country: address.country }),
        ...(address.postcode && { pinCode: address.postcode }),
      };

      // setAddress(formattedAddress);

      // Store in AsyncStorage
      await AsyncStorage.setItem(
        'userCoordinates',
        JSON.stringify({
          latitude,
          longitude,
          address: formattedAddress,
          displayAddress:data.display_name
        })
      );
     
      // await AsyncStorage.setItem(
      //   'userCoordinates',
      //   JSON.stringify({
      //     latitude: latitude,
      //     longitude: longitude,
      //     Address:data.display_name
      //   })
      // );
      // console.log("Address:", data.display_name);
    } catch (error) {
      console.error("Error fetching address:", error);
      setErrorMsg("Failed to fetch address");
    } finally {
      // setLoading(false);
    }
  };

  const fetchShopProducts = async (latitude: number, longitude: number) => {
    try {
      // setLoading(true);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/customer/getshop?latitude=${latitude}&longitude=${longitude}&radius=5`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      
      if (data.status) {
        setShopDataNearByRadius(data.shops || []);
      } else {
        Toast.error("Failed to fetch shops.");
      }
      setLoading(false);
    } catch (error: any) {
      console.error("Error Fetching Data:", error.message);
      setLoading(false);
      Toast.error(error?.message || "Please try again later");
    }
  };

  // const addProductToCart=async(productId:any)=>{
  //   try{
  //     //  setLoading(true);
  //      const response=await fetch(
  //       `${process.env.EXPO_PUBLIC_API_BASE_URL}/customer/cart`,
  //       {
  //         method:"POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body:JSON.stringify({
  //           customerId:"67ed0623767d480a2fa262b1",
  //           productId:productId,
  //           quantity:1 
  //         })
  //       }
  //      )

  //      const data=await response.json();
  //      if(data.status){
  //       // console.log("new product to cart:",data);
  //       setCartData(data.cart.items);
  //      }
  //   }catch(error:any){
  //     console.log("error at addtocart api :",error);
  //   }finally{
  //     // setLoading(false);
  //   }

  // }

  const FetchCartProducts=async()=>{
    try{
      //  setLoading(true);
       const response=await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/customer/cart/${"67ed0623767d480a2fa262b1"}`,
        {
          method:"GET",
          headers: {
            "Content-Type": "application/json",
          }
        }
       )

       const data=await response.json();
      //  console.log("get cart product:",data.data.items);
       if(data.status){
        setCartData(data.data.items);
       }
    }catch(error:any){
      console.log("error at addtocart api :",error);
    }finally{
      // setLoading(false);
    }

  }

  const handleAddtoCart=async(product:any,q:any)=>{
    console.log("selected product:",product);
    const result=await addToCart(product,q);
    console.log("result:",result);
    if(!result.success){
      const userConfirmed = await showConfirmation();
      if (userConfirmed) {
        const updatedResult = await addToCart(product, q, { change: true });
        console.log("updated result:",result);
        setCartData(updatedResult?.cart ?? []);
      }
    }else{
      setCartData(result?.cart ?? []);
    }
    
  }
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <Container position="top" />
      {ConfirmationModal}
      {/* Header */}
      <Animated.View style={[styles.header]}>
        <TouchableOpacity style={styles.locationContainer}>
          <Ionicons name="location-outline" size={28} color="white" />
          {loading ? (
            <ActivityIndicator size="small" color="white" style={{ marginHorizontal: 5 }} />
          ) : (
            <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
              {address || errorMsg}
            </Text>
          )}
          <Ionicons name="chevron-down" size={18} color="white" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={36} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="gray" />
      <TextInput
        placeholder="Search for shops..."
        placeholderTextColor="gray"
        style={styles.searchInput}
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={() => setSearchText("")}>
          <Ionicons name="close" size={24} color="gray" />
        </TouchableOpacity>
      )}
    </View>

      {/* Shop List - Vertical Scroll */}
      <FlatList
        data={filteredShops}
        keyExtractor={(shop) => shop._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      ListEmptyComponent={() =>
        loading ? (
          <>
            {[1, 2].map((_, shopIndex) => (
              <View key={shopIndex} style={styles.shopContainer}>
                {/* Shop Info Skeleton */}
                <View>
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Skeleton colorMode="light" height={15} width={170} radius={4} />
                    <Skeleton colorMode="light" height={15} width={50} radius={4} />
                  </View>
                  <View style={{ marginTop: 5 }}>
                    <Skeleton colorMode="light" height={15} width={250} radius={4} />
                  </View>
                </View>

                {/* Two Product Skeletons (no scroll) */}
                <View style={{ flexDirection: "row", marginTop: 16 }}>
                  {[1, 2].map((_, productIndex) => (
                    <View
                      key={productIndex}
                      style={[
                        styles.productCard,
                        {
                          width: 180,
                          marginRight: 12,
                          borderWidth: 1,
                          borderColor: "lightgray",
                        },
                      ]}
                    >
                      {/* Product Price */}
                      <View style={{ margin: 6, alignItems: "center" }}>
                        <Skeleton colorMode="light" height={14} width={90} radius={4} />
                      </View>

                      {/* Product Image */}
                      <View style={{ alignItems: "center", marginLeft: 12 }}>
                        <Skeleton colorMode="light" height={100} width={"95%"} radius={8} />
                      </View>

                      {/* Product Name */}
                      <View style={{ marginTop: 8, alignItems: "center" }}>
                        <Skeleton colorMode="light" height={12} width={80} radius={4} />
                      </View>

                      {/* Add to Cart button */}
                      <View style={{ marginTop: 8, alignItems: "center" }}>
                        <Skeleton colorMode="light" height={30} width={140} radius={4} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        ) : (
          <Text style={{marginTop:20,textAlign:"center"}}>No shop found</Text>
        )
      }
        renderItem={({ item: shop }) => (
          <View style={styles.shopContainer}>
           <View>
              <View style={{width:"100%",flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                <Text style={styles.shopTitle}>{shop.name}</Text>
                <Text>{shop.distance} km</Text>
              </View>
              <Text style={styles.shopAddress}>{shop.shopAddress}</Text>
           </View>

            {/* Horizontal Scroll for Products */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
              {shop.products.map((product) => (
                <View key={product._id} style={[styles.productCard,{ opacity: product.stock === 0 ? 0.7 : 1, position: "relative" }]}>
                  <View >
                    <View style={styles.productPriceContainer}>
                      <Text style={styles.productPrice}>₹{product?.price}</Text>
                    </View>
                    <TouchableOpacity style={styles.imageContainer} onPress={()=>{setProductId(product?._id);setIsModelOpen(true)}}>
                      <Image source={{ uri: product?.prodId.image }} style={styles.productImage} />
                      {product.stock === 0 || !product.available && (
                        <View style={styles.notAvailableOverlay} pointerEvents="none">
                          <Text style={styles.notAvailableText}>Not Available</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <Text style={styles.productName}>{product?.name}</Text>
                  </View>
                  
                  {
                    cartData.findIndex((item: CartProductType) => item.productId._id === product?._id) !== -1 ? (
                        <View  style={styles.quantitySelector} >
                          <QuantitySelector
                          ProductQuantity={
                          cartData[
                            cartData.findIndex(
                              (item: CartProductType) => item.productId._id === product?._id
                            )
                          ].quantity
                          }
                        productDetails={product}
                      />
                        </View>
                     ) : (
                       <TouchableOpacity style={styles.addtocartContainer} onPress={()=>{
                        // addProductToCart(product._id);
                        handleAddtoCart(product,1)
                        }}>
                        <Text style={styles.addtocartText}>Add to Cart</Text>
                       </TouchableOpacity>
                     )
                  }
                 
                </View>
              ))}
              
            </ScrollView>
            {
              shop.products.length>0 ? (
                <TouchableOpacity style={styles.viewMoreContainer} onPress={()=>router.push(`/commonRoute/categories?id=${shop._id}&shopName=${shop.name}`)}>
                    <Text style={styles.viewMoreTitle}>View More</Text>
                </TouchableOpacity>
              ):(
                <View style={styles.noProductContainer}>
                    <Text style={styles.noProductTitle}>No products available</Text>
                </View>
              )
            }
          </View>
        )}
      />

      {isModelOpen && (
        <ProductDisplayModel 
          visible={isModelOpen} 
          onClose={() => setIsModelOpen(false)} 
          productId={productId} 
        />
      )}
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryColor,
    paddingHorizontal: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 5,
    maxWidth: 200,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  shopContainer: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  shopTitle: { fontSize: 16, fontWeight: "bold" },
  shopAddress: { color: "gray", fontSize: 12 },
  productScroll: { marginTop: 10 },
  productCard: { 
    width: 130,
    marginRight: 10,
    height:220,
    borderWidth:1,
    borderRadius:5 },
  imageContainer:{
    width:"auto",
    marginHorizontal:5
  },
  productImage: { width: 117, height: 100, borderRadius: 5,textAlign:"center" },
  productName: { fontSize: 14,marginTop:5,marginHorizontal:5,fontWeight:"600" },
  productPriceContainer:{
    backgroundColor:"green",
    margin:10,
    borderRadius:10
  },
  productPrice:{ 
    margin:3,
    width:"auto",
    textAlign:"center",
    color: "white",
    fontWeight:"900"
   },
  noDataText: { textAlign: "center", marginTop: 20 },
  viewMoreContainer:{
    borderWidth:1,
    borderRadius:5,
    borderColor:Colors.primaryColor,
    padding:1,
    width:100,
    marginTop:10
  },
  viewMoreTitle:{
  textAlign:"center",
  color:Colors.primaryColor
  },
  noProductContainer:{
    padding:10
  },
  noProductTitle:{
textAlign:"center",
  },
  addtocartContainer:{
    width:"auto",
    marginTop:10,
    marginHorizontal:10,
    borderWidth:1,
    borderRadius:5,
    borderColor:"red"
  },
  addtocartText:{
    color:"red",
    textAlign:"center",
    fontWeight:"600",
    padding:4
  },
  quantitySelector:{
    width:"auto",
    marginTop:10,
    marginHorizontal:10,
    height:30
  },
  notAvailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  
  notAvailableText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  

});
