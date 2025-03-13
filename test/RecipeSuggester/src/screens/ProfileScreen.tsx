// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [pantry, setPantry] = useState<any[]>([]);
  const [ingredient, setIngredient] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProfile = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      const response = await axios.get('http://192.168.1.9:8000/api/users/profile/', {
        headers: { Authorization: `Token ${token}` },
      });
      // Ensure pantry is always an array
      setUser(response.data.user || {});
      setPantry(response.data.pantry || []);
    } catch (error: any) {
      console.error('Error fetching profile', error);
      setErrorMessage('Failed to load profile.');
    }
  };

  const handleAddPantryItem = async () => {
    if (!ingredient) {
      Alert.alert('Error', 'Please enter an ingredient');
      return;
    }
    const token = await SecureStore.getItemAsync('userToken');
    try {
      await axios.post(
        'http://192.168.1.9:8000/api/pantry/',
        { ingredient },
        { headers: { Authorization: `Token ${token}` } }
      );
      // Refresh profile after adding an item
      fetchProfile();
      setIngredient('');
    } catch (error) {
      console.error('Error adding pantry item', error);
      Alert.alert('Error', 'Could not add pantry item');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {user ? (
        <View style={styles.card}>
          <Text style={styles.title}>
            Welcome, {user.first_name} {user.last_name}
          </Text>
          <Text style={styles.info}>Email: {user.email}</Text>
          <Text style={styles.info}>Username: {user.username}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.info}>User profile not available.</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.subtitle}>Your Pantry</Text>
        {pantry && pantry.length > 0 ? (
          pantry.map((item) => (
            <Text key={item.id} style={styles.itemText}>
              {item.ingredient}
            </Text>
          ))
        ) : (
          <Text style={styles.info}>No pantry items found.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Add Pantry Item</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingredient"
          placeholderTextColor="#888"
          value={ingredient}
          onChangeText={setIngredient}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddPantryItem}>
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000', // Main background is black
    padding: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ECE4B7', // Tertiary color for cards
    width: '100%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF4136', // Red for error messages
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  itemText: {
    fontSize: 18,
    color: '#000',
    marginVertical: 4,
  },
  input: {
    height: 50,
    borderColor: '#FBD1A2', // Secondary color for border
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: '#000',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#FC9F5B', // Primary color for button
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
