import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import Colors from '@/constants/Colors'
import { registerContext } from '@/context/registerContext'
import { useSpinner } from '@/context/spinnerContext'
import Container, { Toast } from 'toastify-react-native';
import { useFocusEffect } from 'expo-router'

const emailPage = () => {
    const {registionData,setRegistionData}=useContext(registerContext);
    const {setLoading}=useSpinner();
    const router=useRouter();
    useEffect(()=>{
      setRegistionData((prev) => ({
        ...prev,  
        name: "", 
        phone: "" 
      }));
    },[]);

  //   useFocusEffect(
  //     useCallback(() => {
  //         return () => {
  //             router.replace("/auth/emailPage"); // Redirect when unmounting (going back)
  //         };
  //     }, [])
  // );

    const handleSubmit= async ()=>{
        try {
                setLoading(true);
            
                const response = await fetch(
                  `${process.env.EXPO_PUBLIC_API_BASE_URL}/customer/create`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      phone: Number(registionData.phone),
                      email:registionData.email,
                      name:registionData.name
                    }),
                  }
                );
            
              
            
                const data = await response.json()
                setLoading(false);
            
                if (data.status) {
                  Toast.success("Registation success");
                  setTimeout(() => {
                    router.replace("/auth/login")
                  }, (1000));
                  setRegistionData({email:"",name:"",phone:""})
                } else {        
                    Toast.info(data.message);
                  
                }
              } catch (error: any) {
                console.error("Error Fetching Data:", error.message);
                setLoading(false);
                Toast.error(error?.message||"Please try again later");
              }
    }
  return (
    <>
      <Stack.Screen name="auth/personalDetails" options={{ headerShown: true, 
            headerTitle:"Personal Details",presentation:"modal" }} />

      <Container position="top" />
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>What's your name?</Text>
            <TextInput
            style={[
                styles.input]}
            value={registionData.name}
            keyboardType="default"
            placeholder="xyz"
            onChangeText={(text) => setRegistionData(prev => ({ ...prev, name: text }))}
            />
        </View>

        <View style={[styles.inputContainer,{marginTop:20}]}>
            <Text style={styles.inputLabel}>What's your phone number?</Text>
            <TextInput
            style={[
                styles.input]}
            value={registionData.phone}
            keyboardType="phone-pad"
            placeholder="1234567890"
            onChangeText={(text) => setRegistionData(prev => ({ ...prev, phone: text }))}
            />
        </View>

      </View>
        <TouchableOpacity 
        style={[
            styles.signInBtn, 
            { backgroundColor: registionData.name && registionData.phone ? Colors.primaryColor : "lightgrey" }
          ]} 
          onPress={()=>handleSubmit()}
         >
          <Text style={styles.signInTxt}>Done</Text>
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
    // flex:1,
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