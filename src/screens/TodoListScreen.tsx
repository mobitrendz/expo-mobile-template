import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createTodoApiV1TodosPost,
  deleteTodoApiV1TodosIdDelete,
  readTodosApiV1TodosGet,
  updateTodoApiV1TodosIdPatch,
  type ToDoListPublic,
  type ToDoPriority,
  type ToDoStatus,
} from '../client';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../lib/api-error';

const STATUS_CYCLE: ToDoStatus[] = ['pending', 'in progress', 'completed'];
const STATUS_OPTIONS: ToDoStatus[] = ['pending', 'in progress', 'completed'];
const PRIORITY_OPTIONS: ToDoPriority[] = ['low', 'medium', 'high'];

function nextStatus(current?: ToDoStatus): ToDoStatus {
  const index = STATUS_CYCLE.indexOf(current ?? 'pending');
  return STATUS_CYCLE[(index + 1) % STATUS_CYCLE.length];
}

function statusLabel(status?: ToDoStatus) {
  switch (status) {
    case 'in progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    default:
      return 'Pending';
  }
}

function priorityLabel(priority?: ToDoPriority) {
  switch (priority) {
    case 'high':
      return 'High';
    case 'low':
      return 'Low';
    default:
      return 'Medium';
  }
}

function formatDueDate(value?: string | null) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

type OptionChipProps<T extends string> = {
  label: string;
  value: T;
  selected: T;
  onSelect: (value: T) => void;
  disabled?: boolean;
};

function OptionChip<T extends string>({
  label,
  value,
  selected,
  onSelect,
  disabled,
}: OptionChipProps<T>) {
  const isSelected = value === selected;

  return (
    <Pressable
      style={[styles.chip, isSelected && styles.chipSelected, disabled && styles.chipDisabled]}
      onPress={() => onSelect(value)}
      disabled={disabled}
    >
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

type TaskFormState = {
  title: string;
  description: string;
  priority: ToDoPriority;
  status: ToDoStatus;
  dueDate: Date | null;
};

type TaskModalMode = { type: 'create' } | { type: 'edit'; id: string };

const initialTaskForm = (): TaskFormState => ({
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  dueDate: null,
});

function taskFormFromTodo(todo: ToDoListPublic): TaskFormState {
  const dueDate = todo.due_date_time ? new Date(todo.due_date_time) : null;

  return {
    title: todo.title,
    description: todo.description ?? '',
    priority: todo.priority ?? 'medium',
    status: todo.status ?? 'pending',
    dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
  };
}

function openAndroidDateTimePicker(currentDate: Date | null, onSelect: (date: Date) => void) {
  const baseDate = currentDate ?? new Date();

  DateTimePickerAndroid.open({
    value: baseDate,
    mode: 'date',
    onChange: (event, selectedDate) => {
      if (event.type === 'dismissed' || !selectedDate) {
        return;
      }

      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'time',
        is24Hour: true,
        onChange: (timeEvent, selectedTime) => {
          if (timeEvent.type === 'dismissed' || !selectedTime) {
            return;
          }

          const merged = new Date(selectedDate);
          merged.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
          onSelect(merged);
        },
      });
    },
  });
}

export function TodoListScreen({ onOpenProfile }: { onOpenProfile?: () => void }) {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState<ToDoListPublic[]>([]);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [taskModal, setTaskModal] = useState<TaskModalMode | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskFormError, setTaskFormError] = useState<string | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<ToDoListPublic | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isEditing = taskModal?.type === 'edit';

  const openCreateScreen = () => {
    setTaskForm(initialTaskForm());
    setTaskFormError(null);
    setShowDatePicker(false);
    setTaskModal({ type: 'create' });
  };

  const openEditScreen = (todo: ToDoListPublic) => {
    setTaskForm(taskFormFromTodo(todo));
    setTaskFormError(null);
    setShowDatePicker(false);
    setTaskModal({ type: 'edit', id: todo.id });
  };

  const closeTaskModal = () => {
    setTaskModal(null);
    setTaskForm(initialTaskForm());
    setTaskFormError(null);
    setShowDatePicker(false);
  };

  const loadTodos = useCallback(async () => {
    const { data, error: apiError } = await readTodosApiV1TodosGet();
    if (apiError || !data) {
      throw new Error(getApiErrorMessage(apiError, 'Failed to load todos'));
    }
    setTodos(data.data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadTodos();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load todos');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [loadTodos]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveTask = async () => {
    const title = taskForm.title.trim();
    if (!title) {
      setTaskFormError('Title is required.');
      return;
    }

    if (!taskModal) {
      return;
    }

    setIsSaving(true);
    setTaskFormError(null);

    const body = {
      title,
      description: taskForm.description.trim() || null,
      priority: taskForm.priority,
      status: taskForm.status,
      due_date_time: taskForm.dueDate?.toISOString() ?? null,
    };

    try {
      if (taskModal.type === 'create') {
        const { data, error: apiError } = await createTodoApiV1TodosPost({ body });
        if (apiError || !data) {
          throw new Error(getApiErrorMessage(apiError, 'Failed to create todo'));
        }
        setTodos((prev) => [data, ...prev]);
      } else {
        const { data, error: apiError } = await updateTodoApiV1TodosIdPatch({
          path: { id: taskModal.id },
          body,
        });
        if (apiError || !data) {
          throw new Error(getApiErrorMessage(apiError, 'Failed to update todo'));
        }
        setTodos((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      }

      closeTaskModal();
    } catch (err) {
      setTaskFormError(
        err instanceof Error
          ? err.message
          : taskModal.type === 'create'
            ? 'Failed to create todo'
            : 'Failed to update todo',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDueDatePress = () => {
    if (Platform.OS === 'android') {
      openAndroidDateTimePicker(taskForm.dueDate, (dueDate) => {
        setTaskForm((prev) => ({ ...prev, dueDate }));
      });
      return;
    }

    setShowDatePicker(true);
  };

  const handleDueDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    if (selectedDate) {
      setTaskForm((prev) => ({ ...prev, dueDate: selectedDate }));
    }
  };

  const handleToggleStatus = async (todo: ToDoListPublic) => {
    setBusyId(todo.id);
    setError(null);

    try {
      const status = nextStatus(todo.status);
      const { data, error: apiError } = await updateTodoApiV1TodosIdPatch({
        path: { id: todo.id },
        body: { status },
      });
      if (apiError || !data) {
        throw new Error(getApiErrorMessage(apiError, 'Failed to update todo'));
      }
      setTodos((prev) => prev.map((item) => (item.id === data.id ? data : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    setError(null);

    try {
      const { error: apiError } = await deleteTodoApiV1TodosIdDelete({
        path: { id },
      });
      if (apiError) {
        throw new Error(getApiErrorMessage(apiError, 'Failed to delete todo'));
      }
      setTodos((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (todo: ToDoListPublic) => {
    setTodoToDelete(todo);
  };

  const closeDeleteConfirm = () => {
    setTodoToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!todoToDelete) {
      return;
    }

    const id = todoToDelete.id;
    closeDeleteConfirm();
    await handleDelete(id);
  };

  const renderItem = ({ item }: { item: ToDoListPublic }) => {
    const isBusy = busyId === item.id;
    const dueDate = formatDueDate(item.due_date_time);

    return (
      <View style={styles.todoCard}>
        <Pressable
          style={styles.todoMain}
          onPress={() => handleToggleStatus(item)}
          disabled={isBusy}
        >
          <Text style={[styles.todoTitle, item.status === 'completed' && styles.completed]}>
            {item.title}
          </Text>
          {item.description ? <Text style={styles.todoDescription}>{item.description}</Text> : null}
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{statusLabel(item.status)}</Text>
            </View>
            <Text style={styles.metaText}>Priority: {priorityLabel(item.priority)}</Text>
            {dueDate ? <Text style={styles.metaText}>Due: {dueDate}</Text> : null}
          </View>
        </Pressable>
        <View style={styles.todoActions}>
          <Pressable
            style={styles.editButton}
            onPress={() => openEditScreen(item)}
            disabled={isBusy}
          >
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
          <Pressable
            style={styles.deleteButton}
            onPress={() => confirmDelete(item)}
            disabled={isBusy}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color="#c62828" />
            ) : (
              <Text style={styles.deleteText}>Delete</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  const renderTaskForm = () => (
    <View style={styles.createCard}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        placeholder="What needs to be done?"
        style={styles.input}
        value={taskForm.title}
        onChangeText={(title) => setTaskForm((prev) => ({ ...prev, title }))}
        editable={!isSaving}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        placeholder="Add details (optional)"
        style={[styles.input, styles.textArea]}
        value={taskForm.description}
        onChangeText={(description) => setTaskForm((prev) => ({ ...prev, description }))}
        editable={!isSaving}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.chipRow}>
        {PRIORITY_OPTIONS.map((option) => (
          <OptionChip
            key={option}
            label={priorityLabel(option)}
            value={option}
            selected={taskForm.priority}
            onSelect={(priority) => setTaskForm((prev) => ({ ...prev, priority }))}
            disabled={isSaving}
          />
        ))}
      </View>

      <Text style={styles.label}>Status</Text>
      <View style={styles.chipRow}>
        {STATUS_OPTIONS.map((option) => (
          <OptionChip
            key={option}
            label={statusLabel(option)}
            value={option}
            selected={taskForm.status}
            onSelect={(status) => setTaskForm((prev) => ({ ...prev, status }))}
            disabled={isSaving}
          />
        ))}
      </View>

      <Text style={styles.label}>Due date</Text>
      <View style={styles.dueDateRow}>
        <Pressable
          style={styles.dueDateButton}
          onPress={handleDueDatePress}
          disabled={isSaving}
        >
          <Text style={styles.dueDateButtonText}>
            {taskForm.dueDate
              ? formatDueDate(taskForm.dueDate.toISOString())
              : 'Select date & time'}
          </Text>
        </Pressable>
        {taskForm.dueDate ? (
          <Pressable
            style={styles.clearDueDateButton}
            onPress={() => setTaskForm((prev) => ({ ...prev, dueDate: null }))}
            disabled={isSaving}
          >
            <Text style={styles.clearDueDateText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      {Platform.OS === 'ios' && showDatePicker ? (
        <DateTimePicker
          value={taskForm.dueDate ?? new Date()}
          mode="datetime"
          onChange={handleDueDateChange}
          display="spinner"
        />
      ) : null}

      {taskFormError ? <Text style={styles.createError}>{taskFormError}</Text> : null}

      <Pressable
        style={[styles.createButton, isSaving && styles.createButtonDisabled]}
        onPress={handleSaveTask}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.createButtonText}>
            {isEditing ? 'Save changes' : 'Create task'}
          </Text>
        )}
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={todos.length === 0 ? styles.emptyList : styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No todos yet. Tap Add Task to create one.</Text>
          }
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <View>
                  <Text style={styles.greeting}>My todos</Text>
                  {onOpenProfile ? (
                    <Pressable onPress={onOpenProfile} style={styles.userNameButton}>
                      <Text style={styles.userName}>{user?.full_name ?? user?.email}</Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.userEmail}>{user?.full_name ?? user?.email}</Text>
                  )}
                </View>
                <Pressable onPress={logout} style={styles.logoutButton}>
                  <Text style={styles.logoutText}>Sign out</Text>
                </Pressable>
              </View>

              <Pressable style={styles.addTaskButton} onPress={openCreateScreen}>
                <Text style={styles.addTaskButtonText}>Add Task</Text>
              </Pressable>

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </>
          }
        />
      </View>

      <Modal
        visible={taskModal !== null}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={closeTaskModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={closeTaskModal} style={styles.modalHeaderButton}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Task' : 'New Task'}</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {renderTaskForm()}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={todoToDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteConfirm}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Delete task</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete "{todoToDelete?.title}"? This cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.confirmCancelButton} onPress={closeDeleteConfirm}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmDeleteButton} onPress={handleConfirmDelete}>
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  listContent: {
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f6f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userNameButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  userName: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  logoutText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  addTaskButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  addTaskButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 16 : 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  modalHeaderButton: {
    paddingVertical: 4,
    minWidth: 64,
  },
  modalCancelText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  modalHeaderSpacer: {
    minWidth: 64,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  createCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  chipSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  chipDisabled: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dueDateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dueDateButtonText: {
    fontSize: 15,
    color: '#333',
  },
  clearDueDateButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  clearDueDateText: {
    color: '#666',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  createError: {
    color: '#c62828',
    marginTop: 4,
  },
  error: {
    color: '#c62828',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  todoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todoMain: {
    flex: 1,
    gap: 4,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  todoDescription: {
    fontSize: 14,
    color: '#555',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  todoActions: {
    alignItems: 'flex-end',
    gap: 4,
  },
  editButton: {
    padding: 8,
  },
  editText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    color: '#c62828',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyList: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    paddingHorizontal: 16,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmDialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  confirmMessage: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  confirmCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  confirmCancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmDeleteButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#c62828',
  },
  confirmDeleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
