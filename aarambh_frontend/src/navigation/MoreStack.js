import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreHubScreen from '../screens/more/MoreHubScreen';
import BookmarksScreen from '../screens/bookmarks/BookmarksScreen';
import MentorListScreen from '../screens/mentors/MentorListScreen';
import MentorSlotsScreen from '../screens/mentors/MentorSlotsScreen';
import BookingConfirmationScreen from '../screens/mentors/BookingConfirmationScreen';
import MyDoubtsScreen from '../screens/doubts/MyDoubtsScreen';
import AskDoubtScreen from '../screens/doubts/AskDoubtScreen';
import DoubtDetailScreen from '../screens/doubts/DoubtDetailScreen';
import BatchListScreen from '../screens/batches/BatchListScreen';
import BatchDetailScreen from '../screens/batches/BatchDetailScreen';
import PulseScreen from '../screens/pulse/PulseScreen';
import PredictorScreen from '../screens/predictor/PredictorScreen';
import NotesListScreen from '../screens/notes/NotesListScreen';
import NoteEditorScreen from '../screens/notes/NoteEditorScreen';
import { useHeaderOptions } from './headerOptions';

const Stack = createNativeStackNavigator();

export default function MoreStack() {
  const headerOptions = useHeaderOptions();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="MoreHub" component={MoreHubScreen} options={{ title: 'More' }} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} options={{ title: 'My Bookmarks' }} />
      <Stack.Screen name="MentorList" component={MentorListScreen} options={{ title: 'Mentors' }} />
      <Stack.Screen name="MentorSlots" component={MentorSlotsScreen} />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{ title: 'Booked', headerBackVisible: false }}
      />
      <Stack.Screen name="MyDoubts" component={MyDoubtsScreen} options={{ title: 'My Doubts' }} />
      <Stack.Screen name="AskDoubt" component={AskDoubtScreen} options={{ title: 'Ask a Doubt' }} />
      <Stack.Screen name="DoubtDetail" component={DoubtDetailScreen} options={{ title: 'Doubt' }} />
      <Stack.Screen name="BatchList" component={BatchListScreen} options={{ title: 'Batches' }} />
      <Stack.Screen name="BatchDetail" component={BatchDetailScreen} />
      <Stack.Screen name="Pulse" component={PulseScreen} options={{ title: "Today's Pulse" }} />
      <Stack.Screen name="Predictor" component={PredictorScreen} options={{ title: 'Predictor' }} />
      <Stack.Screen name="Notes" component={NotesListScreen} options={{ title: 'My Notes' }} />
      <Stack.Screen name="NoteEditor" component={NoteEditorScreen} options={{ title: 'Note' }} />
    </Stack.Navigator>
  );
}
