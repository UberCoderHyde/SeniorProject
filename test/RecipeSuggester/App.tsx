// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegistrationScreen from './src/screens/Registration';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RecipeDiscoveryScreen from './src/screens/RecipeDiscoveryScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';

export type AuthStackParamList = {
  Login: undefined;
  Registration: undefined;
  Home: undefined;
  Profile: undefined;
};

export type RecipeStackParamList = {
  RecipeDiscovery: undefined;
  RecipeDetail: { recipeId: number };
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const RecipeStack = createStackNavigator<RecipeStackParamList>();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator initialRouteName="Login">
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Registration" component={RegistrationScreen} options={{ title: 'Register' }} />
      <AuthStack.Screen name="Home" component={HomeScreen} options={{ title: 'Recipe Suggester Home' }} />
      <AuthStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Your Profile' }} />
    </AuthStack.Navigator>
  );
}

function RecipeStackNavigator() {
  return (
    <RecipeStack.Navigator initialRouteName="RecipeDiscovery">
      <RecipeStack.Screen name="RecipeDiscovery" component={RecipeDiscoveryScreen} options={{ title: 'Discover Recipes' }} />
      <RecipeStack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Recipe Details' }} />
    </RecipeStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      {/* Use your preferred navigator; here we are displaying the AuthStackNavigator */}
      <AuthStackNavigator />
      {/* Uncomment below to include the recipe navigator */}
      {/* <RecipeStackNavigator /> */}
    </NavigationContainer>
  );
}
