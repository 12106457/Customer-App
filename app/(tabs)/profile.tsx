import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import React from 'react'
import { AntDesign, Entypo, Ionicons, MaterialIcons, MaterialCommunityIcons, EvilIcons, SimpleLineIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Separator = () => (
  <View style={styles.separator} />
);

const Profile = () => {
  const router=useRouter();
  const handleLogout=async()=>{
    await AsyncStorage.removeItem("authToken")
    await AsyncStorage.removeItem("userData");
    router.replace("/auth/login")
  }
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Wallet Section */}
        <View style={styles.walletContainer}>
          <TouchableOpacity>
            <View style={styles.walletHeader}>
              <View style={styles.walletTitle}>
                <Entypo name="wallet" size={22} color="#eb6e30" />
                <Text style={styles.walletText}>Smart Mart Cash & Gift Card</Text>  
              </View>
              <AntDesign name="right" size={18} color="black" />
            </View>
          </TouchableOpacity>
          <Separator />
          <View style={styles.walletBalance}>
            <Text style={styles.walletBalanceText}>Available Balance: <Text style={styles.boldText}>₹0</Text></Text>
            <TouchableOpacity style={styles.addBalanceBtn}>
              <Text style={styles.addBalanceText}>Add Balance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.infoCard}>
            {[
              { label: 'Orders', icon: <Ionicons name="bag-outline" size={22} color="black" /> },
              { label: 'E-gift Cards', icon: <MaterialIcons name="card-giftcard" size={23} color="black" /> },
              { label: 'Help & Support', icon: <AntDesign name="message1" size={22} color="black" /> },
              { label: 'Refunds', icon: <MaterialCommunityIcons name="cash-refund" size={28} color="black" /> },
              { label: 'Saved Addresses', icon: <EvilIcons name="location" size={32} color="black" /> },
              { label: 'Profile', icon: <EvilIcons name="user" size={32} color="black" /> },
              { label: 'Rewards', icon: <EvilIcons name="trophy" size={32} color="black" /> },
            ].map((item, index, array) => (
              <View key={index}>
                <TouchableOpacity style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    {item.icon}
                    <Text style={styles.infoText}>{item.label}</Text>
                  </View>
                  <AntDesign name="right" size={18} color="black" />
                </TouchableOpacity>
                {index < array.length - 1 && <Separator />}
              </View>
            ))}
          </View>
        </View>

        {/* Other Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Information</Text>
          <View style={styles.infoCard}>
            {[
              { label: 'Suggest Shops', icon: <MaterialCommunityIcons name="star-plus-outline" size={24} color="black" />},
              { label: 'Notifications', icon: <MaterialIcons name="notifications-none" size={24} color="black" /> },
              { label: 'General Info', icon: <SimpleLineIcons name="info" size={24} color="black" /> },
            ].map((item, index, array) => (
              <View key={index}>
                <TouchableOpacity style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    {item.icon}
                    <Text style={styles.infoText}>{item.label}</Text>
                  </View>
                  <AntDesign name="right" size={18} color="black" />
                </TouchableOpacity>
                {index < array.length - 1 && <Separator />}
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.section,styles.btnContainer]} onPress={()=>handleLogout()}>
            <Text style={styles.btnTxt}>Log Out</Text>
        </TouchableOpacity>

        <View style={[styles.section,styles.versionContainer]}>
            <Text style={styles.versionTxt}>App version 1.01.1</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default Profile;

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 10,
    backgroundColor: "#e8e7e6",
  },
  container: {
    flex: 1,
  },
  walletContainer: {
    backgroundColor: "#fdf4ef",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "auto",
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#ebbea7"
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%"
  },
  walletTitle: {
    flexDirection: "row",
    alignItems: "center",
    width: "auto"
  },
  walletText: {
    fontWeight: "700",
    marginLeft: 10,
    fontSize: 16
  },
  walletBalance: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 7
  },
  walletBalanceText: {
    color: "gray",
    fontSize: 15
  },
  boldText: {
    fontWeight: "700",
    color: "black"
  },
  addBalanceBtn: {
    padding: 2,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "white"
  },
  addBalanceText: {
    fontSize: 12,
    padding: 3,
    paddingHorizontal: 5
  },
  section: {
    marginTop: 25
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 22
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 7,
    width: "100%",
    elevation: 1,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginTop: 10
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "auto",
    paddingVertical: 10
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  infoText: {
    fontSize: 18,
    marginLeft: 10
  },
  separator: {
    width: "100%",
    height: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    marginVertical: 5
  },
  btnContainer:{
    borderWidth:0.3,
    backgroundColor:"white",
    padding:13,
    borderRadius:5
  },
  btnTxt:{
    textAlign:"center",
    fontWeight:"600",
    fontSize:16
  },
  versionContainer:{
    marginBottom:10
  },
  versionTxt:{
    textAlign:"center",
    color:"gray",
    fontWeight:"700"
  }
});
