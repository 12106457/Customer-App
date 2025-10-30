import { BackHandler, Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import { useFocusEffect, useRouter } from 'expo-router';
import Login from "./auth/login"
import Dashboard from './(tabs)/home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfileData } from '@/context/userProfileContent';
const index = () => {
    const router=useRouter();
    const {setAuthToken,setUserData}=useProfileData()
    // useEffect(() => {
    //   // Delay navigation until after mounting
    //   setTimeout(() => {
    //     router.replace("/auth/login"); // Use replace to prevent going back
    //   }, 100); 
    // }, []);
    useFocusEffect(
      useCallback(() => {
        const onBackPress = () => {
          BackHandler.exitApp(); // Exit the app instead of going back
          return true; // Prevent default behavior
        };
  
        BackHandler.addEventListener("hardwareBackPress", onBackPress);
  
        return () => {
          BackHandler.removeEventListener("hardwareBackPress", onBackPress);
        };
      }, [])
    );
    useEffect(() => {
      const checkUserData = async () => {
        const userData = await AsyncStorage.getItem("userData");
        const Token=await AsyncStorage.getItem("authToken")
        const timer = setTimeout(() => {
          if (userData&&Token) {
             setUserData(JSON.parse(userData));
             setAuthToken(JSON.parse(Token));
            router.replace("/(tabs)/home");
          } else {
            router.replace("/auth/login");
          }
        }, 100); 

        return () => clearTimeout(timer); 
      };

      checkUserData();
    }, []);
  return (
    <>
      {/* <Login/> */}
      {/* <Dashboard/> */}
      <Text style={{margin:20,textAlign:"center",color:"red"}}>This is splash screen </Text>
    </>
  )
}

export default index

const styles = StyleSheet.create({
    container:{
        // flex:1,
        // justifyContent:"flex-start",
        // alignItems:"center",
        // backgroundColor:Colors.bgColor
    },
    
})