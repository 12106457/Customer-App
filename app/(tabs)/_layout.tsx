import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { AntDesign, Entypo, Feather, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ToastManager,{ Toast } from "toastify-react-native";
export default function _layout() {
  const { top, bottom } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        
        tabBarStyle: {
          backgroundColor: Colors.bgColor,
          borderTopWidth: 0,
          height: 60,
          paddingTop: 10,
          paddingBottom:  10+ bottom,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.black,
        tabBarInactiveTintColor: "#999",
      }}
    >
     
      <Tabs.Screen
        name="home"
        options={{
          headerShown:false,
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={30} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="categories"
        options={{
          tabBarButton: () => null,
          tabBarIcon: ({ color }) => (
            // <Entypo name="shop" size={24} color={color} />
            <MaterialIcons name="dashboard-customize" size={30} color={color} />
          ),
          headerTitle: "Categories",
          tabBarStyle: { display: 'none' },
        }}
      /> */}
     
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ color }) => (
            // <MaterialCommunityIcons name="cart-arrow-up" size={24} color={color} />
            <Feather name="shopping-bag" size={30} color={color} />
          ),
          headerTitle: "Orders",
        }}
      />

    <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="shopping-cart" size={30} color={color} />
          ),
        //   tabBarItemStyle: {
        //     backgroundColor: Colors.primaryColor,
        //     borderRadius: 10,
        //   },
          headerTitle: "Cart",
        
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            // <FontAwesome name="user" size={24} color={color} />
            <FontAwesome5 name="user-circle" size={30} color={color} />
          ),
          headerTitle: "Profile",
        }}
      />
      {/* tabBarStyle: { display: 'none' }, // to hide the tab section for particular */}
    </Tabs>
  );
}
