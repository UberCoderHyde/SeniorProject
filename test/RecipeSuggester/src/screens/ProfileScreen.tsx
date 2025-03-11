// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TextInput, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [pantry, setPantry] = useState<any[]>([]);
  const [ingredient, setIngredient] = useState('');
  const [quantity, setQuantity] = useState('');

  const fetchProfile = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      const response = await axios.get('https://your-django-api.com/api/users/profile/', {
        headers: { Authorization: `Token ${token}` },
      });
      // Assuming the API returns an object with user details and pantry items.
      setUser(response.data.user);
      setPantry(response.data.pantry);
    } catch (error) {
      console.error('Error fetching profile', error);
    }
  };

  const handleAddPantryItem = async () => {
    if (!ingredient || !quantity) {
      Alert.alert('Error', 'Please enter both ingredient and quantity');
      return;
    }
    const token = await SecureStore.getItemAsync('userToken');
    try {
      await axios.post(
        'https://your-django-api.com/api/pantry/',
        { ingredient, quantity },
        { headers: { Authorization: `Token ${token}` } }
      );
      // Refresh profile to update pantry list
      fetchProfile();
      setIngredient('');
      setQuantity('');
    } catch (error) {
      console.error('Error adding pantry item', error);
      Alert.alert('Error', 'Could not add pantry item');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      {user && (
        <View style={styles.profileSection}>
          <Text style={styles.title}>
            Welcome, {user.first_name} {user.last_name}
          </Text>
          <Text>Email: {user.email}</Text>
          <Text>Username: {user.username}</Text>
        </View>
      )}
      <View style={styles.pantrySection}>
        <Text style={styles.subtitle}>Your Pantry</Text>
        <FlatList
          data={pantry}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Text>
              {item.ingredient} - {item.quantity}
            </Text>
          )}
          ListEmptyComponent={<Text>No pantry items found.</Text>}
        />
      </View>
      <View style={styles.addPantrySection}>
        <Text style={styles.subtitle}>Add Pantry Item</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingredient"
          value={ingredient}
          onChangeText={setIngredient}
        />
        <TextInput
          style={styles.input}
          placeholder="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <Button title="Add Item" onPress={handleAddPantryItem} />
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  profileSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  pantrySection: {
    flex: 1,
    marginBottom: 24,
  },
  addPantrySection: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});
