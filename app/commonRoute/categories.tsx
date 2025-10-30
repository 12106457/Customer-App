import QuantitySelector from '@/components/ui/quantitySelector';
import Colors from '@/constants/Colors';
import { useCart } from '@/context/cartContent';
import { CartProductType, ProductDetails } from '@/models/common';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useRouter, useSearchParams } from 'expo-router/build/hooks';
import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import ProductDisplayModel from "@/components/productDisplayContainer"
import { addToCart } from '@/utility/cartFunctions';
import { useConfirmationModal } from '@/components/customHook/useConfirmationModel';

// interface ProductDetails {
//   _id: string;
//   prodId: {
//     _id: string;
//     name: string;
//     image: string;
//   };
//   name: string;
//   category: string;
//   description: string;
//   price: number;
//   shopId: string;
//   available: boolean;
// };

interface CategoryType {
  id: string;
  name: string;
  image: string;
}

const CategoryPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<Record<string, ProductDetails[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const route=useRouter()
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const shopName = searchParams.get('shopName');
  const {cartData,setCartData}= useCart()
  const [isModelOpen,setIsModelOpen]=useState(false);
  const [productId,setProductId]=useState<string>("");
  const {ConfirmationModal,showConfirmation}=useConfirmationModal()
  useEffect(() => {
    if (id) fetchShopProducts();
  }, [id]);

  const fetchShopProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/customer/view-all-products/${id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        }
      );
      const result = await response.json();
      console.log("Raw API result:", result);
      if (result.status) {
        const products = result.data;

        const categoryMap: Record<string, CategoryType> = {};
        const productMap: Record<string, ProductDetails[]> = {};

        products.forEach((product: any) => {
          const catId = product.category._id;
          const catName = product.category.name;
          const catImage = product.category.image;

          if (!categoryMap[catId]) {
            categoryMap[catId] = {
              id: catId,
              name: catName,
              image: catImage || 'https://img.icons8.com/fluency/48/category.png',
            };
          }

          if (!productMap[catId]) {
            productMap[catId] = [];
          }

          productMap[catId].push({
            _id: product._id,
            prodId: product.prodId,
            name: product.name,
            category: product.category._id,
            description: product.description,
            price: product.price,
            shopId: product.shopId,
            available: product.available,
            stock:product.stock
          });
        });

        setCategories(Object.values(categoryMap));
        setGroupedProducts(productMap);
        setSelectedCategoryId(Object.keys(productMap)[0]);
      }
    } catch (e) {
      console.log("error at fetching shop products api in category page:", e);
    } finally {
      setIsLoading(false);
    }
  };
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

  const filteredProducts = useMemo(() => {
    return selectedCategoryId ? groupedProducts[selectedCategoryId] || [] : [];
  }, [groupedProducts, selectedCategoryId]);

  const renderCategoryItem = ({ item }: { item: CategoryType }) => (
    <TouchableOpacity
      style={[styles.categoryItem, item.id === selectedCategoryId && styles.selectedCategory]}
      onPress={() => setSelectedCategoryId(item.id)}
    >
      <Image source={{ uri: item.image||"https://img.icons8.com/fluency/48/category.png" }} style={styles.categoryImage} />
     
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: ProductDetails }) => (
    <View key={item._id} style={[styles.productCard,{ opacity: item.stock === 0 ? 0.7 : 1, position: "relative" }]}>
      <View>
        <View style={styles.productPriceContainer}>
          <Text style={styles.productPrice}>₹{item?.price}</Text>
        </View>
        <TouchableOpacity style={styles.imageContainer} onPress={() => {
          setProductId(item?._id);setIsModelOpen(true)
        }}>
          <Image source={{ uri: item?.prodId.image }} style={styles.productImage} />
          {(item.stock === 0 || !item.available) && (
            <View style={styles.notAvailableOverlay} pointerEvents="none">
              <Text style={styles.notAvailableText}>Not Available</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.productName}>{item?.name}</Text>
      </View>
  
      {
        cartData.findIndex((cartItem: CartProductType) => cartItem.productId._id === item?._id) !== -1 ? (
          <View style={styles.quantitySelector}>
            <QuantitySelector
              ProductQuantity={
                cartData[
                  cartData.findIndex(
                    (cartItem: CartProductType) => cartItem.productId._id === item?._id
                  )
                ].quantity
              }
              productDetails={item}
            />
          </View>
        ) : (
          <TouchableOpacity style={styles.addtocartContainer} onPress={() => {
            // addProductToCart(item._id);
            handleAddtoCart(item, 1)
          }}>
            <Text style={styles.addtocartText}>Add to Cart</Text>
          </TouchableOpacity>
        )
      }
    </View>
  );
  

  return (
    <>
      <Stack.Screen
  // name="CategoryScreen"
  options={{
    headerShown: true,
    headerTitle: shopName || "Category",
    headerLeft: () => (
      <TouchableOpacity onPress={() => route.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />

      </TouchableOpacity>
    ),
  }}
/>
{ConfirmationModal}

      <View style={styles.container}>
        <View style={styles.sidebarContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.productContainer}>
          {isLoading ? (
            <Text>Loading...</Text>  
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={{ padding: 10,paddingBottom:80 }}
              showsVerticalScrollIndicator={false}
              
            />
          )}
        </View>
        {true && (
          <View style={styles.cartBar}>
            <TouchableOpacity style={styles.cartButton} onPress={() => route.push('/cart')}>
              <Text style={styles.cartButtonText}>View Cart</Text>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartData.length}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

      {isModelOpen && (
        <ProductDisplayModel 
          visible={isModelOpen} 
          onClose={() => setIsModelOpen(false)} 
          productId={productId} 
        />
      )}

      </View>
    </>
  );
};

export default CategoryPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    
  },
  sidebarContainer: {
    width: 100,
    backgroundColor: '#f8f8f8',
    borderRightWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginVertical: 10,
    padding: 5,
  },
  selectedCategory: {
    backgroundColor: '#e0f0ff',
    borderRadius: 10,
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
  },
  productContainer: {
    flex: 1,
    padding: 5,
  },
  row: {
    justifyContent: 'space-between',
    marginHorizontal: 5,
    marginBottom:10
    
  },
  // productCard: {
  //   width: '48%',
  //   backgroundColor: '#fff',
  //   borderRadius: 10,
  //   padding: 10,
  //   margin: 5,
  //   alignItems: 'center',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 2,
  // },
  // productImage: {
  //   width: 70,
  //   height: 70,
  //   borderRadius: 10,
  //   marginBottom: 10,
  // },
  productText: {
    fontSize: 14,
    fontWeight: '500',
  },
  price: {
    fontSize: 13,
    color: 'green',
    marginTop: 5,
  },
  cartBar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 10,
    alignItems: 'center',
  },
  
  cartButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00C853', // or your primary green
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  cartBadge: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  cartBadgeText: {
    color: '#00C853',
    fontWeight: 'bold',
    fontSize: 14,
  },
  productCard: { 
      width: '48%',
      marginRight: 10,
      height:220,
      borderWidth:1,
      borderRadius:5 },
    imageContainer:{
      width:"auto",
      marginHorizontal:5
    },
    productImage: { width: 107, height: 100, borderRadius: 5,textAlign:"center",marginHorizontal:"auto" },
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
