import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
  Button,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons'; // You can use other icon libraries too
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const DEFAULT_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const AddressPicker = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [initialCoords, setInitialCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [formatAddress,setFormatAddress]=useState({});
  const [loading, setLoading] = useState(true);
  const [mapMoving, setMapMoving] = useState(false);
  const [showCurrentButton, setShowCurrentButton] = useState(false);
  const mapRef = useRef<MapView>(null);
  const route=useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      const mapRegion = { ...coords, ...DEFAULT_DELTA };

      setRegion(mapRegion);
      setInitialCoords(coords);
      fetchAddress(coords);
      setLoading(false);
    })();
  }, []);

  const fetchAddress = async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const addr = result[0];
        const displayAddress = `${addr.name ?? ''}, ${addr.street ?? ''}, ${addr.city ?? ''}, ${addr.region ?? ''}, ${addr.postalCode ?? ''}, ${addr.country ?? ''}`;
        setAddress(displayAddress);
        const formattedAddress = {
          street: addr.street || addr.name || '',
          city: addr.city || '',
          state: addr.region || '',
          country: addr.country || '',
          pinCode: addr.postalCode || '',
        };
        setFormatAddress(formattedAddress);
      }
    } catch (error) {
      console.error("Failed to reverse geocode:", error);
      setAddress("Unable to fetch address");
    }
  };

  const onRegionChange = (newRegion: Region) => {
    setMapMoving(true);
    setRegion(newRegion);

    // Show "Current Location" button if user moved far from initial point
    if (initialCoords) {
      const distance = Math.sqrt(
        Math.pow(initialCoords.latitude - newRegion.latitude, 2) +
        Math.pow(initialCoords.longitude - newRegion.longitude, 2)
      );

      setShowCurrentButton(distance > 0.001); // Adjust this threshold as needed
    }
  };

  const onRegionChangeComplete = (finalRegion: Region) => {
    setMapMoving(false);
    setRegion(finalRegion);
    fetchAddress({ latitude: finalRegion.latitude, longitude: finalRegion.longitude });
  };

  const moveToCurrentLocation = async () => {
    if (!initialCoords) return;
    const newRegion = {
      ...initialCoords,
      ...DEFAULT_DELTA,
    };
    mapRef.current?.animateToRegion(newRegion, 1000);
    setShowCurrentButton(false);
  };

  const handleSelectAddress=async()=>{
    await AsyncStorage.setItem(
      'userCoordinates',
      JSON.stringify({
        latitude: region?.latitude,
        longitude: region?.longitude,
        address:formatAddress,
        displayAddress:address
      })
    );
    route.back();
  }

  return (
    <View style={styles.container}>
      {loading || !region ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>Loading map...</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onRegionChange={onRegionChange}
            onRegionChangeComplete={onRegionChangeComplete}
          />

          {/* Fixed pin in the center */}
          <View style={styles.markerFixed}>
            <Image src='https://cdn-icons-png.flaticon.com/512/684/684908.png' style={styles.marker} />
          </View>

          {/* "Current Location" floating button */}
          {showCurrentButton && (
            <TouchableOpacity style={styles.locationButton} onPress={moveToCurrentLocation}>
              <Ionicons name="navigate" size={24} color="#fff" />
            </TouchableOpacity>
          )}

          <View style={styles.addressBox}>
            {/* <Text style={styles.label}>Center Coordinates:</Text>
            <Text style={styles.value}>Lat: {region.latitude.toFixed(6)}</Text>
            <Text style={styles.value}>Lng: {region.longitude.toFixed(6)}</Text> */}
            {mapMoving ? (
              <Text style={{ fontStyle: 'italic', marginTop: 5 }}>Moving map...</Text>
            ) : address ? (
              <>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{address}</Text>
              </>
            ) : (
              <Text style={styles.value}>Fetching address...</Text>
            )}
            <View style={styles.BtnContainer}>
               <Button title='Select Address' onPress={()=>handleSelectAddress()}/>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: '80%',
  },
  loadingBox: {
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerFixed: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    marginLeft: -24,
    marginTop: -48,
    zIndex: 999,
  },
  marker: {
    width: 48,
    height: 48,
  },
  addressBox: {
    flex:1,
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    position:"relative"
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginTop: 2,
  },
  locationButton: {
    position: 'absolute',
    bottom: '22%',
    right: 20,
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 12,
    elevation: 5,
    zIndex: 999,
  },
  BtnContainer:{
    position:"absolute",
    bottom:15,
    width:"100%",
    marginHorizontal:13
    // alignItems:"center"
  }
});

export default AddressPicker;
