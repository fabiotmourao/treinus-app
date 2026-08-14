import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SplashScreen } from '../screens/SplashScreen';
import { SyncScreen } from '../screens/SyncScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { ExerciseDetailsScreen } from '../screens/ExerciseDetailsScreen';
import { ExerciseGroupExercisesScreen } from '../screens/ExerciseGroupExercisesScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { WorkoutsScreen } from '../screens/WorkoutsScreen';
import { WorkoutDetailsScreen } from '../screens/WorkoutDetailsScreen';
import { WorkoutExercisePickerScreen } from '../screens/WorkoutExercisePickerScreen';
import { WorkoutExerciseGroupScreen } from '../screens/WorkoutExerciseGroupScreen';
import { WorkoutExerciseEditScreen } from '../screens/WorkoutExerciseEditScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/darkColors';

export type RootStackParamList = {
  Splash: undefined;
  Sync: undefined;
  Main: undefined;
  ExerciseDetails: { exerciseId: string };
  ExerciseGroupExercises: { groupKey: string; groupLabel: string; bodyView: 'front' | 'back' };
  WorkoutDetails: { workoutId: string };
  WorkoutExercisePicker: { workoutId: string };
  WorkoutExerciseGroup: {
    workoutId: string;
    groupKey: string;
    groupLabel: string;
    bodyView: 'front' | 'back';
  };
  WorkoutExerciseEdit: { workoutId: string; workoutExerciseId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Exercises: undefined;
  Favorites: undefined;
  Workouts: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  return <Ionicons name={name} size={22} color={color} />;
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.borderCard,
          height: 66 + insets.bottom,
          paddingTop: 6,
          paddingBottom: 6 + insets.bottom,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#7a8595',
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Treinos',
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Exercises"
        component={ExercisesScreen}
        options={{
          title: 'Exercícios',
          tabBarLabel: 'Exercícios',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'barbell' : 'barbell-outline'} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favoritos',
          tabBarLabel: 'Favoritos',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'heart' : 'heart-outline'} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{
          title: 'Workouts',
          tabBarLabel: 'Workouts',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'fitness' : 'fitness-outline'} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Sync" component={SyncScreen} options={{ title: 'Sincronização' }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} options={{ title: 'Detalhes do exercício' }} />
      <Stack.Screen name="ExerciseGroupExercises" component={ExerciseGroupExercisesScreen} options={{ title: 'Exercícios do grupo' }} />
      <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} options={{ title: 'Treino' }} />
      <Stack.Screen name="WorkoutExercisePicker" component={WorkoutExercisePickerScreen} options={{ title: 'Adicionar exercício' }} />
      <Stack.Screen name="WorkoutExerciseGroup" component={WorkoutExerciseGroupScreen} options={{ title: 'Adicionar exercício' }} />
      <Stack.Screen name="WorkoutExerciseEdit" component={WorkoutExerciseEditScreen} options={{ title: 'Editar exercício' }} />
    </Stack.Navigator>
  );
}
