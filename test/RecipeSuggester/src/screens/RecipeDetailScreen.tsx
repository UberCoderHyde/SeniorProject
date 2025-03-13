// src/screens/RecipeDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { RouteProp } from '@react-navigation/native';
import { RecipeStackParamList } from '../../App';

type RecipeDetailScreenRouteProp = RouteProp<RecipeStackParamList, 'RecipeDetail'>;

type Props = {
  route: RecipeDetailScreenRouteProp;
};

type RecipeDetail = {
  id: number;
  title: string;
  description: string;
  ingredients: Array<{ ingredient: string; quantity: string }>;
  instructions: string;
};

const RecipeDetailScreen: React.FC<Props> = ({ route }) => {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [shoppingList, setShoppingList] = useState<string[]>([]);

  const fetchRecipeDetail = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      const response = await axios.get(`http://192.168.1.9:8000/api/recipes/${recipeId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setRecipe(response.data);
    } catch (error) {
      console.error('Error fetching recipe detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShoppingList = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      const response = await axios.get(`http://192.168.1.9:8000/api/recipes/${recipeId}/shopping-list/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setShoppingList(response.data);
    } catch (error) {
      console.error('Error generating shopping list:', error);
      Alert.alert('Error', 'Could not generate shopping list.');
    }
  };

  useEffect(() => {
    fetchRecipeDetail();
  }, []);

  if (loading || !recipe) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FC9F5B" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.description}>{recipe.description}</Text>
      <Text style={styles.subtitle}>Ingredients:</Text>
      {recipe.ingredients.map((item, index) => (
        <Text key={index} style={styles.itemText}>
          {item.ingredient} - {item.quantity}
        </Text>
      ))}
      <Text style={styles.subtitle}>Instructions:</Text>
      <Text style={styles.instructions}>{recipe.instructions}</Text>
      <TouchableOpacity style={styles.button} onPress={generateShoppingList}>
        <Text style={styles.buttonText}>Generate Shopping List</Text>
      </TouchableOpacity>
      {shoppingList.length > 0 && (
        <View style={styles.shoppingList}>
          <Text style={styles.subtitle}>Shopping List:</Text>
          {shoppingList.map((item, index) => (
            <Text key={index} style={styles.itemText}>- {item}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default RecipeDetailScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#D3D3D3',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#D3D3D3',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#D3D3D3',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#D3D3D3',
    marginVertical: 4,
  },
  instructions: {
    fontSize: 16,
    color: '#D3D3D3',
    marginBottom: 20,
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#FC9F5B',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shoppingList: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ECE4B7',
    borderRadius: 8,
  },
});
