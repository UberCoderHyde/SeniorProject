// src/screens/RecipeDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView, Alert } from 'react-native';
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
      const response = await axios.get(`https://your-django-api.com/api/recipes/${recipeId}/`, {
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
      const response = await axios.get(`https://your-django-api.com/api/recipes/${recipeId}/shopping-list/`, {
        headers: { Authorization: `Token ${token}` },
      });
      // Assuming the API returns an array of missing ingredient names
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
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.description}>{recipe.description}</Text>
      <Text style={styles.subtitle}>Ingredients:</Text>
      {recipe.ingredients.map((item, index) => (
        <Text key={index}>
          {item.ingredient} - {item.quantity}
        </Text>
      ))}
      <Text style={styles.subtitle}>Instructions:</Text>
      <Text>{recipe.instructions}</Text>
      <Button title="Generate Shopping List" onPress={generateShoppingList} />
      {shoppingList.length > 0 && (
        <View style={styles.shoppingList}>
          <Text style={styles.subtitle}>Shopping List:</Text>
          {shoppingList.map((item, index) => (
            <Text key={index}>- {item}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default RecipeDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  shoppingList: {
    marginTop: 16,
  },
});
