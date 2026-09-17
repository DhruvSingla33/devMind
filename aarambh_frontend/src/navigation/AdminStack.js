import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHubScreen from '../screens/admin/AdminHubScreen';
import AdminTextbookListScreen from '../screens/admin/AdminTextbookListScreen';
import AdminTextbookFormScreen from '../screens/admin/AdminTextbookFormScreen';
import AdminTextbookDetailScreen from '../screens/admin/AdminTextbookDetailScreen';
import AdminChapterFormScreen from '../screens/admin/AdminChapterFormScreen';
import AdminChapterPagesScreen from '../screens/admin/AdminChapterPagesScreen';
import AdminPageFormScreen from '../screens/admin/AdminPageFormScreen';
import AdminQuestionListScreen from '../screens/admin/AdminQuestionListScreen';
import AdminQuestionFormScreen from '../screens/admin/AdminQuestionFormScreen';
import AdminBulkQuestionUploadScreen from '../screens/admin/AdminBulkQuestionUploadScreen';
import AdminMentorFormScreen from '../screens/admin/AdminMentorFormScreen';
import AdminBatchListScreen from '../screens/admin/AdminBatchListScreen';
import AdminBatchFormScreen from '../screens/admin/AdminBatchFormScreen';
import AdminPulseFormScreen from '../screens/admin/AdminPulseFormScreen';
import AdminDoubtsScreen from '../screens/admin/AdminDoubtsScreen';
import headerOptions from './headerOptions';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="AdminHub" component={AdminHubScreen} options={{ title: 'Admin' }} />
      <Stack.Screen
        name="AdminTextbookList"
        component={AdminTextbookListScreen}
        options={{ title: 'Textbooks' }}
      />
      <Stack.Screen
        name="AdminTextbookForm"
        component={AdminTextbookFormScreen}
        options={{ title: 'Textbook' }}
      />
      <Stack.Screen name="AdminTextbookDetail" component={AdminTextbookDetailScreen} />
      <Stack.Screen
        name="AdminChapterForm"
        component={AdminChapterFormScreen}
        options={{ title: 'Chapter' }}
      />
      <Stack.Screen
        name="AdminChapterPages"
        component={AdminChapterPagesScreen}
        options={{ title: 'Pages' }}
      />
      <Stack.Screen
        name="AdminPageForm"
        component={AdminPageFormScreen}
        options={{ title: 'Page' }}
      />
      <Stack.Screen
        name="AdminQuestionList"
        component={AdminQuestionListScreen}
        options={{ title: 'Questions' }}
      />
      <Stack.Screen
        name="AdminQuestionForm"
        component={AdminQuestionFormScreen}
        options={{ title: 'Question' }}
      />
      <Stack.Screen
        name="AdminBulkQuestionUpload"
        component={AdminBulkQuestionUploadScreen}
        options={{ title: 'Bulk import' }}
      />
      <Stack.Screen
        name="AdminMentorForm"
        component={AdminMentorFormScreen}
        options={{ title: 'Mentors' }}
      />
      <Stack.Screen
        name="AdminBatchList"
        component={AdminBatchListScreen}
        options={{ title: 'Batches' }}
      />
      <Stack.Screen
        name="AdminBatchForm"
        component={AdminBatchFormScreen}
        options={{ title: 'Batch' }}
      />
      <Stack.Screen
        name="AdminPulseForm"
        component={AdminPulseFormScreen}
        options={{ title: 'Aarambh Pulse' }}
      />
      <Stack.Screen name="AdminDoubts" component={AdminDoubtsScreen} options={{ title: 'Doubts' }} />
    </Stack.Navigator>
  );
}
