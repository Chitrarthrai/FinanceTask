import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TasksScreen from "../screens/TasksScreen";
import NotesView from "../components/NotesView";

const Stack = createNativeStackNavigator();

const TasksStackNavigator = () => {
  return (
    <Stack.Navigator
      id="TasksStack"
      initialRouteName="TasksList"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}>
      <Stack.Screen name="TasksList" component={TasksScreen} />
      <Stack.Screen name="NotesList" component={NotesView} />
    </Stack.Navigator>
  );
};

export default TasksStackNavigator;
