import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TasksScreen from "../screens/TasksScreen";
import NotesView from "../components/NotesView";

const Stack = createNativeStackNavigator();

const TasksStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="TasksList"
      screenOptions={{
        headerShown: false,
        animation: "none", // Instant switch to prevent flashing
      }}>
      <Stack.Screen name="TasksList" component={TasksScreen} />
      <Stack.Screen name="NotesList" component={NotesView} />
    </Stack.Navigator>
  );
};

export default TasksStackNavigator;
