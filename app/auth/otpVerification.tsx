import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image'
import Colors from '@/constants/Colors';
import { useSpinner } from '@/context/spinnerContext';
import Container, { Toast } from 'toastify-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfileData } from '@/context/userProfileContent';

const OtpInput: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const {purpose,email}=useLocalSearchParams();
  const [count, setCount] = useState(30);
  const {setLoading}=useSpinner();
  const router = useRouter();
  const {setAuthToken,setUserData}=useProfileData()
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  const handleResend = () => {
    if (count === 0) {
      resendOtp();
    }
  };

  const resendOtp= async ()=>{
    try {
      setLoading(true);
  
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/mail/resend-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email:email
          }),
        }
      );
  
    
  
      const data = await response.json()
      setLoading(false);
  
      if (data.status) {
        Toast.success(data.message);
        setCount(30); 
      } else {
       
          Toast.error(data.message);

      }
    } catch (error: any) {
      console.error("Error Fetching Data:", error.message);
      setLoading(false);
      Toast.error(error?.message||"Please try again later");
    }
  } 

  const handleChange = (text: string, index: number): void => {
    if (/^\d*$/.test(text)) { 
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text.length > 0 && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ): void => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];

      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = ''; 
      }

      setOtp(newOtp);
    }
  };


  const handleSubmit= async ()=>{
    if(purpose==="login"){
      try {
          setLoading(true);
      
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_BASE_URL}/customer/verify-login-otp`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email:email,
                otp: otp.join(""),
              }),
            }
          );
      
        
      
          const data = await response.json()
          setLoading(false);
      
          if (data.status) {
            Toast.success(data.message);
            await AsyncStorage.setItem("userData",JSON.stringify(data.data));
            await AsyncStorage.setItem("authToken",JSON.stringify(data.token));
            setUserData(data.data);
            setAuthToken(data.token);
            setTimeout(() => {
              router.replace("/(tabs)/home")
            }, 1000);
          } else {
            if(data.message==="No record found"){
              Toast.info("Please check your number");
            }else if(data.message==="Wrong OTP"){
              Toast.info("Wrong OTP");
            }else{
              Toast.info(data.message);
            }
          }
        } catch (error: any) {
          console.error("Error Fetching Data:", error.message);
          setLoading(false);
          Toast.error(error?.message||"Please try again later");
        }
    }else{
      try {
        setLoading(true);
    
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/mail/verifyotp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email:email,
              otp: Number(otp.join("")),
            }),
          }
        );
    
      
    
        const data = await response.json()
        setLoading(false);
    
        if (data.status) {
          Toast.success(data.message);
          setTimeout(() => {
            router.push("/auth/personalDetails")
          }, 1000);
        } else {
          if(data.message==="Wrong OTP"){
            Toast.info("Wrong OTP");
          }else{
            Toast.info(data.message);
          }
        }
      } catch (error: any) {
        console.error("Error Fetching Data:", error.message);
        setLoading(false);
        Toast.error(error?.message||"Please try again later");
      }
    }
  }

  const maskEmail = (email: string | string[]) => {
    if (typeof email !== "string") return ""; // Ensure email is a string
  
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return email; // Return original email if invalid
  
    return `${localPart.charAt(0)}*******${localPart.charAt(localPart.length - 1)}@${domain}`;
  };
  
  

  return (
    <>
      <Stack.Screen name="auth/otpVerification" options={{ headerShown: true, 
                headerTitle:"OTP Verification", presentation:"modal" }} />
      <Container position="top" />
      <View style={{ flex: 1, justifyContent: "space-between", alignItems: "center", width: '100%',paddingHorizontal:20,backgroundColor: "white",paddingVertical:10 }}>
        <View style={{ backgroundColor: "white", flex: 1 }}>
          <View style={styles.InfoContainer}>
            <Image source={require('../../assets/gif/mail.gif')} style={styles.gifIcon} contentFit="contain" />
            <Text style={styles.InfoTitle}>Check your email</Text>
            <Text style={styles.infoDescription}>Please check your email and enter the six-digit number for verification.we send to</Text>
            <Text>{maskEmail(email)}</Text>
          </View>

          <View style={styles.container}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.input}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                ref={(ref) => (inputRefs.current[index] = ref)}
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.resendContainer, 
              count > 0 && { opacity: 0.5 } // Disable effect
            ]} 
            onPress={count > 0 ? undefined : handleResend} 
            disabled={count > 0}
          >
            <Text style={[styles.resendBtn, count > 0 && styles.disabledResendBtn]}>
              {count > 0 ? `Resend in ${count}s` : "Resend"}
            </Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity
          style={[
            styles.signInBtn, 
            { backgroundColor: otp.every(digit => digit !== '') ? Colors.primaryColor : "lightgrey" }
          ]} 
          disabled={otp.some(digit => digit === '')} 
          onPress={()=>handleSubmit()}
        >
          <Text style={styles.signInTxt}>Continue</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  InfoContainer:{
    justifyContent:"center",
    alignItems:"center"
  },
  InfoTitle:{
    fontSize:20,
    fontWeight:"800"
  },
  infoDescription:{
    textAlign:"center",
    marginHorizontal:50,
    marginTop:10,
    fontSize:16
  },
  input: {
    width: 50,
    height: 50,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 18,
  },
  gifIcon:{
    width:100,
    height:100,
    marginTop:20
  },
   signInBtn: {
      width: "100%",
      padding: 15,
      borderRadius: 10,
    },
    signInTxt: {
      color: Colors.white,
      fontSize: 20,
      textAlign: "center",
    },
    resendContainer: {
      alignSelf: "flex-start",
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    
    resendBtn: {
      borderWidth: 1,
      borderColor: Colors.primaryColor,
      color: Colors.primaryColor,
      fontSize: 16,
      fontWeight: "500",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
      textAlign: "center",
    },
    
    disabledResendBtn: {
      borderColor: "gray",
      color: "gray",
    },
    
    
});

export default OtpInput;
