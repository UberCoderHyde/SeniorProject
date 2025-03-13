// src/screens/RecipeDiscoveryScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RecipeStackParamList } from '../../App';

type RecipeDiscoveryScreenNavigationProp = StackNavigationProp<RecipeStackParamList, 'RecipeDiscovery'>;

type Recipe = {
  id: number;
  title: string;
  description: string;
};

type Props = {
  navigation: RecipeDiscoveryScreenNavigationProp;
};

const RecipeDiscoveryScreen: React.FC<Props> = ({ navigation }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRecipes = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      const response = await axios.get('http://192.168.1.9:8000/api/recipes/', {
        headers: { Authorization: `Token ${token}` },
      });
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeItem}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
    >
      <Text style={styles.recipeTitle}>{item.title}</Text>
      <Text style={styles.recipeDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FC9F5B" />
      </View>
    );
  }

  return (
    <FlatList
      data={recipes}
      style={styles.listContainer}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderRecipe}
      ListEmptyComponent={<Text style={styles.info}>No recipes available.</Text>}
    />
  );
};

export default RecipeDiscoveryScreen;

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: '#000', // Main background is black
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  recipeItem: {
    backgroundColor: '#ECE4B7', // Tertiary color for cards
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#000',
  },
  info: {
    fontSize: 16,
    color: '#D3D3D3',
    textAlign: 'center',
  },
});
