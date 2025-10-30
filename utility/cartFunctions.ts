import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductData, CartProductType } from '@/models/common';

const CART_KEY = 'CART_ITEMS';

interface AddToCartOptions {
  change?: boolean; // Optional, default: false
}

export const addToCart = async (
  product: ProductData,
  quantity: number,
  options: AddToCartOptions = {}
) => {
  const { change = false } = options; // default false
  
  try {
    const existingCartStr = await AsyncStorage.getItem(CART_KEY);
    let existingCart: CartProductType[] = existingCartStr ? JSON.parse(existingCartStr) : [];

    // Check if the cart is empty, in which case no conflict should occur
    if (existingCart.length === 0) {
      // No conflict, directly add the product
      existingCart.push({
        productId: product,
        quantity,
        totalAmount: product.price * quantity,
      });

      await AsyncStorage.setItem(CART_KEY, JSON.stringify(existingCart));
      return { success: true, cart: existingCart };
    }

    // Check shopId mismatch
    if (
      existingCart.length > 0 &&
      existingCart[0].productId.shopId !== product.shopId
    ) {
      if (!change) {
        return {
          success: false,
          reason: 'shop_conflict',
        };
      } else {
        // Clear cart if change is true
        existingCart = [];
      }
    }

    const index = existingCart.findIndex(
      (item) => item.productId._id === product._id
    );

    if (index !== -1) {
      if (quantity === 0) {
        // Remove item
        existingCart.splice(index, 1);
      } else {
        // Update quantity
        existingCart[index].quantity = quantity;
        existingCart[index].totalAmount = product.price * quantity;
      }
    } else if (quantity > 0) {
      // Add new product
      existingCart.push({
        productId: product,
        quantity,
        totalAmount: product.price * quantity,
      });
    }

    await AsyncStorage.setItem(CART_KEY, JSON.stringify(existingCart));

    return { success: true, cart: existingCart };
  } catch (error) {
    console.error('Error updating cart:', error);
    return { success: false, reason: 'exception' };
  }
};


export const getCart = async (): Promise<CartProductType[]> => {
    try {
      const cartStr = await AsyncStorage.getItem(CART_KEY);
      return cartStr ? JSON.parse(cartStr) : [];
    } catch (error) {
      console.error('Error retrieving cart:', error);
      return [];
    }
  };
  

export const resetCart = async () => {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify([]));
    return { success: true };
  } catch (error) {
    console.error('Error resetting cart:', error);
    return { success: false, reason: 'exception' };
  }
};
