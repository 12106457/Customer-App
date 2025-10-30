import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import { Stack, useRouter } from 'expo-router'
import Colors from '@/constants/Colors'
import { registerContext } from '@/context/registerContext'
import { useSpinner } from '@/context/spinnerContext'
import Container, { Toast } from 'toastify-react-native';
const emailPage = () => {
  const router = useRouter();
  const {registionData,setRegistionData}=useContext(registerContext)
  const {setLoading}=useSpinner();
  const handleSubmit=async ()=>{
    console.log("registerdata:",registionData);
    try {
            setLoading(true);
        
            const response = await fetch(
              `${process.env.EXPO_PUBLIC_API_BASE_URL}/mail/send`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email:registionData.email,
                }),
              }
            );
        
          
        
            const data = await response.json()
            setLoading(false);
        
            if (data.status) {
              Toast.success(data.message);
              setTimeout(() => {
                router.push(`/auth/otpVerification?purpose=register&email=${registionData.email}`)
              }, 1000);
            } else if(data.message==="OTP already sent to mail") {
                Toast.info(data.message);
                router.push(`/auth/otpVerification?purpose=register&email=${registionData.email}`)
            }
          } catch (error: any) {
            console.error("Error Fetching Data:", error.message);
            setLoading(false);
            Toast.error(error?.message||"Please try again later");
          }
  }
  return (
    <>
      <Stack.Screen name="auth/emailPage" options={{ headerShown: true, 
            headerTitle:"Continue with Email",presentation:"modal" }} />
      <Container position="top" />
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Please enter your email</Text>
        <TextInput
          style={[
            styles.input]}
            value={registionData.email}
          keyboardType="email-address"
          placeholder="abc@xyz.com"
          onChangeText={(text) => setRegistionData(prev => ({ ...prev, email: text }))}
        />
      </View>
      <TouchableOpacity 
        style={[
          styles.signInBtn, 
          { backgroundColor: registionData.email ? Colors.primaryColor : "lightgrey" }
        ]} 
        onPress={() => handleSubmit()}
        disabled={!registionData.email} // Disables button if email is empty
      >
        <Text style={styles.signInTxt}>Continue</Text>
      </TouchableOpacity>

    </View>
    </>
  )
}

export default emailPage

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"space-between",
    alignItems:"center",
    marginVertical:10,
    marginHorizontal:10
  },
  signInBtn: {
    width: "100%",
    padding: 15,
    // backgroundColor:"#0373fc",
    backgroundColor: Colors.primaryColor,
    borderRadius: 10,
    
  },
  signInTxt: {
    color: Colors.white,
    fontSize: 20,
    textAlign: "center",
  },
   inputContainer:{
    flex:1,
    justifyContent:"flex-start",
    alignItems:"flex-start",
    width:"100%"
  },
  input: {
      width: "100%",
      borderRadius: 15,
      backgroundColor: Colors.bgColor,
      color: Colors.black,
      padding: 15,
      marginTop: 5,
      fontSize: 18,
      borderWidth:1,
      borderColor:"lightgrey"
  },
  inputLabel:{
  fontSize:19,
  fontWeight:"500",
  marginBottom:5
  }
})