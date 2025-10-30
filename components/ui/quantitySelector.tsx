import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useCart } from "@/context/cartContent";
import { addToCart } from "@/utility/cartFunctions";

const QuantitySelector = ({ ProductQuantity, productDetails }: any) => {
  const [quantity, setQuantity] = useState(ProductQuantity||1);
  const { setCartData } = useCart();


  useEffect(()=>{
    setQuantity(ProductQuantity);
  },[ProductQuantity])

  const handleIncrease = () => {
    const updatedQuantity = quantity + 1;
    setQuantity(updatedQuantity);
    handleUpdateCart(updatedQuantity);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      const updatedQuantity = quantity - 1;
      setQuantity(updatedQuantity);
      handleUpdateCart(updatedQuantity);
    }
  };

  const handleUpdateCart = async (quan: number) => {
    const result = await addToCart(productDetails, quan);
    console.log("result in quantity selector:", result);
    setCartData(result?.cart ?? []);
  };

  return (
    <View style={styles.quantityContainer}>
      <TouchableOpacity style={[styles.button, styles.sideButton]} onPress={handleDecrease}>
        <AntDesign name="minus" size={14} color="white" />
      </TouchableOpacity>

      <Text style={styles.quantityText}>{quantity}</Text>

      <TouchableOpacity style={[styles.button, styles.sideButton]} onPress={handleIncrease}>
        <AntDesign name="plus" size={14} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    backgroundColor: "#FF6347",
    width: "auto",
    height: "100%",
    overflow: "hidden",
  },
  sideButton: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: "auto",
  },
  quantityText: {
    width: "40%",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});

export default QuantitySelector;
