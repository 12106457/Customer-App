import Colors from "@/constants/Colors";
import { useSpinner } from "@/context/spinnerContext";
import { AntDesign, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import Container, { Toast } from "toastify-react-native";
import QuantitySelector from "./ui/quantitySelector";
import { useCart } from "@/context/cartContent";
import {CartItem,CartProductType,ProductData} from "@/models/common"
import { useRouter } from "expo-router";
import { addToCart } from "@/utility/cartFunctions";
import { useConfirmationModal } from "./customHook/useConfirmationModel";
import { useFocusEffect } from "@react-navigation/native";
const { height } = Dimensions.get("screen");
import { Skeleton } from 'moti/skeleton';

const BottomSheetModal = ({ visible, onClose, productId }: any) => {

  console.log("productId:",productId);
  const [product, setProduct] = useState<ProductData|null>();
  const [highLightButton, setHighLightButton] = useState(false);
  const [informationButton, setinformationButton] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isProductAddedToCart,setIsProductAddedToCart]=useState(false);
  const [cartCount,setCartCount]=useState(0);
  const {cartData,setCartData}=useCart()
  const { setLoading,loading } = useSpinner();
  const route=useRouter();
   const {ConfirmationModal,showConfirmation}=useConfirmationModal()

  useEffect(() => {
    setCartCount(cartData.length);
  
    const foundItem = cartData.find((item:CartProductType) => item.productId._id === product?._id);
  
    if (foundItem) {
      setQuantity(foundItem.quantity);
      setIsProductAddedToCart(true);
    } else {
      setIsProductAddedToCart(false);
    }
  
    // console.log("cartData:", cartData);
  }, [cartData, product]);


  // useFocusEffect(

  //   useCallback(()=>{

  //     fetchProductDetails();
  //   },[])
  // );

  useEffect(()=>{
    if(productId!==""){
      fetchProductDetails()
    }
  },[productId])
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/customer/getproduct?id=${productId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      setLoading(false);

      if (data.status) {
        console.log("productDisplaycontainer data:",data);
        setProduct(data.data);
      } else {
        Toast.info(data.message);
      }
    } catch (err: any) {
      console.log("error occurs while fetching products:", err);
      setLoading(false);
      Toast.error(err?.message || "Please try again later");
    }finally{
      setLoading(false);
    }
  };

  const addProductToCart=async()=>{
    try{
       setLoading(true);
       const response=await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/customer/cart`,
        {
          method:"POST",
          headers: {
            "Content-Type": "application/json",
          },
          body:JSON.stringify({
            customerId:"67ed0623767d480a2fa262b1",
            productId:product?._id,
            quantity:1 
          })
        }
       )

       const data=await response.json();
       if(data.status){
        // console.log("new product to cart:",data);
        setCartData(data.cart.items);
       }
    }catch(error:any){
      console.log("error at addtocart api :",error);
    }finally{
      setLoading(false);
    }

  }

  const handleAddToProduct = async (q:any) => {
    if (!product) {
      Toast.error("Product data not available. Please try again.");
      return;
    }
  
    const alreadyInCart = cartData.some((item) => item.productId._id === product._id);
    if (alreadyInCart) {
      Toast.info("Product is already in the cart.");
      return;
    }
  
    // addProductToCart();
    handleAddtoCart(q);
    setIsProductAddedToCart(true);
  };

  const handleAddtoCart = async (q: any) => {
    if (!product) {
      Toast.error("Product data not available.");
      return;
    }
  
    console.log("selected product:", product);
    const result = await addToCart(product, q); // now TypeScript knows it's safe
    console.log("result:", result);
  
    if (!result.success) {
      const userConfirmed = await showConfirmation();
      if (userConfirmed) {
        const updatedResult = await addToCart(product, q, { change: true });
        console.log("updated result:", updatedResult);
        setCartData(updatedResult?.cart ?? []);
      }
    } else {
      setCartData(result?.cart ?? []);
    }
  };
  useEffect(()=>{
    if(visible===false){
      setProduct(null);
    }
  },[visible])
  

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <Container position="top" />
      {ConfirmationModal}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <AntDesign name="closecircleo" size={40} color="white" />
      </TouchableOpacity>
     <ScrollView style={styles.modalContainer} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Product Image */}
        <View
          style={{
            padding: 20,
            backgroundColor: "white",
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}
        >
          {loading?<Skeleton colorMode="light" height={250} width={"100%"} radius={8} />:<Image
            source={{ uri: product?.prodId?.image }}
            style={styles.productImage}
          />
          }

          {/* Product Details */}
          {loading?<Skeleton colorMode="light" height={20} width={150} radius={4} />:<Text style={styles.productName}>{product?.name}</Text>}
          {
            loading?<Skeleton colorMode="light" height={20} width={250} radius={4} />:<View style={styles.productDetailContainer}>
            <Text style={styles.productQuantity}>1-1.05 kg </Text>
            <Text style={styles.productRating}>
              <AntDesign name="star" size={14} color="white" /> 4.4
            </Text>
            <Text style={[styles.productQuantity, { marginLeft: 2 }]}>
              (100)
            </Text>
          </View>
          }
          {
            loading?<Skeleton colorMode="light" height={40} width={"auto"} radius={4} />:product?.stock===0||!product?.available&&<View style={styles.notAvailableContainer}>
               <Text style={styles.notAvailableText}>Currently product not available</Text>
            </View>
          }
        </View>

        <View style={styles.iconContainer}>
          {
            loading?<Skeleton colorMode="light" height={"100%"} width={"100%"} radius={4} /> :<View style={styles.iconSection}>
            <Image
              source={require("../assets/icons/delivery-icon.png")} // Directly require the image
              style={{ width: 50, height: 50 }}
            />
            <Text style={styles.iconText}>Fast Delivery</Text>
          </View>
          }
          {
            loading?<Skeleton colorMode="light" height={"100%"} width={"50%"} radius={4} /> :<View style={styles.iconSection}>
            <Image
              source={require("../assets/icons/trust-icon.png")} // Directly require the image
              style={{ width: 50, height: 50 }}
            />
            <Text style={styles.iconText}>Trusted Seller</Text>
          </View>
          }
          
        </View>

        <View
          style={{
            marginHorizontal: 10,
            borderRadius: 10,
            backgroundColor: "white",
            padding: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3, // Android shadow
          }}
        >
          {/* Expand/Collapse Button */}
          <TouchableOpacity
            style={styles.highlightContainer}
            onPress={() => setHighLightButton(!highLightButton)}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ padding: 3, fontWeight: "600", fontSize: 18 }}>
                Highlights
              </Text>
              {highLightButton ? (
                <Entypo name="chevron-small-up" size={30} color="black" />
              ) : (
                <Entypo name="chevron-small-down" size={30} color="black" />
              )}
            </View>
          </TouchableOpacity>

          {/* Collapsible Content */}
          {highLightButton && (
            <View style={styles.contentContainer}>
              <View style={styles.row}>
                <Text style={styles.label}>Company</Text>
                <Text style={styles.value}>NO</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Quantity</Text>
                <Text style={styles.value}>NO</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.value}>{product?.description}</Text>
              </View>
            </View>
          )}
        </View>

        <View
          style={{
            marginHorizontal: 10,
            borderRadius: 10,
            backgroundColor: "white",
            padding: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3, // Android shadow
            marginVertical: 6,
          }}
        >
          {/* Expand/Collapse Button */}
          <TouchableOpacity
            style={styles.highlightContainer}
            onPress={() => setinformationButton(!informationButton)}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ padding: 3, fontWeight: "600", fontSize: 18 }}>
                Information
              </Text>
              {informationButton ? (
                <Entypo name="chevron-small-up" size={30} color="black" />
              ) : (
                <Entypo name="chevron-small-down" size={30} color="black" />
              )}
            </View>
          </TouchableOpacity>

          {/* Collapsible Content */}
          {informationButton && (
            <View style={styles.contentContainer}>
              <View style={styles.row}>
                <Text style={styles.label}>Disclaimer</Text>
                <Text style={styles.value}>
                  All images are for representational purposes only. It is
                  advised that you read the batch and manufacturing details,
                  directions for use, allergen information, health and
                  nutritional claims (wherever applicable), and other details
                  mentioned on the label before consuming the product. For combo
                  items, individual prices can be viewed on the page.
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Customer Care Details</Text>
                <Text style={styles.value}>
                  In case of any issue, contact us E-mail address:
                  support@smartmart.com
                </Text>
              </View>
            </View>
          )}
        </View>

      </ScrollView>
      <View style={styles.addtocartContainer}>
      {/* If Product is Added to Cart */}
      {isProductAddedToCart ? (
        <>
          {/* Left Section - Cart Icon & "View Cart" */}
          <View style={[styles.halfContainer, styles.leftContainer]}>
            <TouchableOpacity style={styles.cartContainer} onPress={()=>route.push("/(tabs)/cart")}>
              <MaterialCommunityIcons name="cart-outline" size={28} color="black" />
              <Text style={styles.cartCount}>{cartCount}</Text>
              <Text style={styles.viewCartText}>View Cart</Text>
            </TouchableOpacity>
            {/* <View style={styles.viewCartBox}>
              <Text style={styles.viewCartText}>View Cart</Text>
            </View> */}
          </View>

          {/* Right Section - Quantity Selector */}
          <View style={styles.halfContainer}>
            <QuantitySelector ProductQuantity={quantity} productDetails={product}/>
          </View>
        </>
      ) : (
        /* If Product is Not Added to Cart */
        <>
          {/* Cart Icon with Count */}
          <TouchableOpacity style={[styles.cartContainer,{paddingHorizontal:20,marginRight:30}]} onPress={()=>route.push("/(tabs)/cart")}>
            <MaterialCommunityIcons name="cart-outline" size={28} color="black" />
            <Text style={styles.cartCount}>{cartCount}</Text>
          </TouchableOpacity>

          {/* Add to Cart Button with More Space */}
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() =>handleAddToProduct(1)}
          >
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent:"flex-start",
    alignItems:"center",
    paddingTop:"25%"
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    marginBottom:70,
    width: "100%",
    backgroundColor: "#e1f4f7",
    // padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.7, // 60% of screen height

  },
  productImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    borderRadius: 10,
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  productDetailContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 3,
    marginTop: 5,
  },
  productQuantity: {
    fontSize: 14,
    color: "gray",
    // marginVertical: 10,
  },
  productRating: {
    backgroundColor: "green",
    color: "white",
    padding: 1,
    borderRadius: 5,
    paddingHorizontal: 4,
  },
  notAvailableContainer:{
   width:"auto",
   paddingHorizontal:6,
   marginTop:10,
  },
  notAvailableText:{
    color:"red",
    fontWeight:"700",
    fontSize:24
  },
  iconContainer: {
    width: "auto",
    height: 120,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 6,
    marginHorizontal: 10,
  },
  iconSection: {
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 16,
    fontWeight: "600",
  },
  highlightContainer: {
    height: 37,
    justifyContent: "center",
  },
  contentContainer: {
    marginTop: 10,
    marginHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:"space-between",
    marginBottom: 5,
  },
  label: {
    width: "30%",
    fontWeight: "bold",
    color: "gray",
    textAlign: "left",  
    alignSelf: "flex-start",
  },
  value: {
    width: "60%",
    fontWeight:"300"
  },
 
  addtocartContainer: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "white",
    height: 70,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  halfContainer: {
    width: "50%",
    height:40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  leftContainer: {
    justifyContent: "flex-start",
    paddingLeft: 15,
  },
  cartContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 6,
    position: "relative",
  },
  cartCount: {
    position: "absolute",
    right: -5,  // Adjusts badge position
    top: -5,    // Moves the badge slightly upwards
    width: 18,
    height: 18,
    backgroundColor: "#FF6347",
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  viewCartBox: {
    borderWidth: 1,
    borderColor: "black",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  viewCartText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    paddingVertical:5,
    marginLeft:10
  },
  addToCartButton: {
    flex: 1, // Occupies more space when cart is not added
    marginVertical: 10,
    backgroundColor: "#FF6347",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  
});

export default BottomSheetModal;
