import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
  } from "react-native";
  import React, { useContext, useEffect, useState } from "react";
  import Colors from "@/constants/Colors";
  import { AntDesign, Octicons } from "@expo/vector-icons";
  import { useRouter } from "expo-router";
  import { useSpinner } from "@/context/spinnerContext";
//   import { loginResponse } from "@/models/common";
//   import { ProfileContext } from "@/context/profileContext";
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import Container, { Toast } from 'toastify-react-native';
//   import { useAuth } from "@/context/authContext";
import SeparatorWithLabel from "@/components/ui/SeparatorWithLabel"
  const login = () => {
    const [formData, setFormData] = useState({
      phone: "",
    });
    const router = useRouter();
    const { setLoading } = useSpinner();
    // const {setAuthToken,setProfileData,setShopDetails}=useContext(ProfileContext)
    const [formDataError,SetFormDataError]=useState({
      phone:false,
    })
    const [secureText, setSecureText] = useState(true);
    // const { login } = useAuth();
    const toggleSecureTextEntry = () => {
      setSecureText(!secureText);
    };
    const handleChange = ({ text, field }: { text: string; field: string }) => {
      setFormData((prev) => ({ ...prev, [field]: text }));
    };
  
    // useEffect(()=>{
    //   fetchShopCategory();
    // },[])
  
   
  
    const storeData = async (key:any, value:any) => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        console.log("Data stored successfully");
      } catch (error) {
        console.error("Error storing data:", error);
      }
    };
  
    const getData = async (key:any) => {
      try {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error("Error in getting data from localstorage");
      }
    }
  
    // const fetchShopCategory = () => {
    //   // setLoading(true);
    //     fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/master/get`, {
    //       method: "GET",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     })
    //       .then((response) => {
    //         if (!response.ok) {
    //           return response.text().then((errorText) => {
    //             console.error("Server Error:", errorText);
    //             throw new Error("Something went wrong");
    //           });
    //         }
    //         return response.json();
    //       })
    //       .then((data) => {
    //         if (data.status) {
    //           storeData("shopCategory",data.data);
    //           setLoading(false);
    //         } else {
    //           Toast.error(data.message);
    //         }
    //       })
    //       .catch((error) => {
    //         console.error("Error Fetching Data:", error.message);
    //         Toast.error("Something went wrong")
    //       });
          
    //   };
  
    const handleSubmit = () => {
     
      const errors = {
        phone: formData.phone.trim() === "",
      };
    
      SetFormDataError(errors);
     if(formData.phone.trim()===""){
      return Toast.info("Please enter phone number")
     }else if(formData.phone.length!==10){
        return Toast.error("Phone number should be 10 digit")
      }
     
      if (Object.values(errors).includes(true)) return;
    
      // router.push("/auth/otpVerification")
      LoginApi();
    };
    
    const LoginApi = async () => {
      try {
        setLoading(true);
    
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/customer/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone: Number(formData.phone),
            }),
          }
        );
    
      
    
        const data = await response.json()
        setLoading(false);
    
        if (data.status) {
          Toast.success(data.message);
          setTimeout(() => {
            router.push(`/auth/otpVerification?purpose=login&email=${data.data.email}`)
          }, 1500);
        } else {
          if(data.message==="No record found"){
            Toast.info("Please check your number");
          }else if(data.message==="OTP already sent to mail"){
            Toast.info(data.message);
            setTimeout(() => {
              router.push(`/auth/otpVerification?purpose=login&email=${data.data.email}`)
            }, 1500);
          }else{

            Toast.info(data.message);
          }
        }
      } catch (error: any) {
        console.error("Error Fetching Data:", error.message);
        setLoading(false);
        Toast.error(error?.message||"Please try again later");
      }
    };
    const handleToast = async () => {
      Toast.success('Promise if Resolved');
    };
    
    
    return (
      <View style={styles.container}>
        <Container position="top" />
        <View style={{ width: "100%", height: "40%" }}>
          <ImageBackground
            source={require("../../assets/images/shopping-basket.jpg")}
            style={styles.bgImage}
            resizeMode="cover"
          ></ImageBackground>
        </View>
        <View style={{ width: "100%", height: "60%" }}>
          {/* <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/splashlogo.png")}
              style={styles.logo}
            />
          </View> */}
  
          <View style={styles.titleContainer}>
            <Text style={styles.title}>India’s #1 Local Shop Delivery & Takeaway App.</Text>
            <SeparatorWithLabel title="Log in or sign up"/>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                formDataError.phone && { borderColor: "red", borderWidth: 1 }
              ]}
              value={formData.phone}
              keyboardType="phone-pad"
              placeholder="Enter Phone"
              onChangeText={(text) => handleChange({ text, field: "phone" })}
            />
            {/* <View style={styles.passwordcontainer}>
              <TextInput
                style={[
                  styles.input,
                  formDataError.password && { borderColor: "red", borderWidth: 1 }
                ]}
                placeholder="Enter Password"
                secureTextEntry={secureText}
                onChangeText={(text) => handleChange({ text, field: "password" })}
              />
              <TouchableOpacity
                onPress={toggleSecureTextEntry}
                style={styles.iconContainer}
              >
                {!secureText ? (
                  <AntDesign
                    name={"eyeo"} // Change icon based on visibility
                    size={24}
                    color="gray"
                  />
                ) : (
                  <Octicons name="eye-closed" size={24} color="gray" />
                )}
              </TouchableOpacity>
            </View> */}
            <TouchableOpacity style={styles.signInBtn} onPress={() =>{handleSubmit()}}>
              <Text style={styles.signInTxt}>Log In</Text>
            </TouchableOpacity>
          </View>
          <View style={{paddingHorizontal:20}}>
            <SeparatorWithLabel title="or"/>
          </View>
           <View style={{width:"100%",paddingHorizontal:20}}>
           <TouchableOpacity style={styles.signupBtn} onPress={() => {
            router.push("/auth/emailPage")
            }}>
              <Text style={styles.signupTxt}>Register</Text>
            </TouchableOpacity>
           </View>
           <View style={styles.termAndConditionContainer}>
                <Text style={styles.termAndConditionsTitle}>
                    By continuing, you agree to out
                </Text>
                <Text style={[styles.termAndConditionsTitle,{textDecorationLine:"underline"}]}>
                    Terms of Services Privacy Policy  Content policy
                </Text>
           </View>
        </View>
      </View>
    );
  };
  
  export default login;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors.white,
    },
    bgImage: {
      flex: 1,
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    logoContainer: {
      width: "100%",
      height: 120,
      marginTop: -50,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: Colors.primaryColor,
      tintColor: Colors.white,
    },
    titleContainer: {
      width: "100%",
      marginTop:20,
      paddingHorizontal:20,
    },
    title: {
      fontSize: 28,
      fontWeight: "900",
      textAlign: "center",
      

    },
    subtitle: {
      fontSize: 22,
      fontWeight: "700",
      textAlign: "center",
    },
    inputContainer: {
      width: "100%",
      marginTop: 0,
      gap: 15,
      paddingHorizontal: 20,
    },
    input: {
      width: "100%",
      borderRadius: 15,
      backgroundColor: Colors.bgColor,
      color: Colors.black,
      padding: 15,
      marginTop: 5,
      fontSize: 18,
    },
    passwordcontainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      position: "absolute",
      right: 10,
      top: "50%",
      transform: [{ translateY: -12 }],
    },
    signInBtn: {
      width: "100%",
      padding: 15,
      // backgroundColor:"#0373fc",
      backgroundColor: Colors.primaryColor,
      borderRadius: 20,
    },
    signInTxt: {
      color: Colors.white,
      fontSize: 20,
      textAlign: "center",
    },
    signupBtn:{
      width: "100%",
      padding: 11,
      // backgroundColor:"#0373fc",
      borderWidth:2,
      borderColor: Colors.primaryColor,
      borderRadius: 20,
    },
    signupTxt:{
      textAlign:"center",
      color: Colors.primaryColor,
      fontSize: 20,
    },
    termAndConditionContainer:{
        marginTop:20
    },
    termAndConditionsTitle:{
        textAlign:"center",
        fontSize:12
    }

  });
  