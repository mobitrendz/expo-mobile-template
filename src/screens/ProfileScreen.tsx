import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  deleteUserApiV1UsersIdDelete,
  updatePasswordApiV1UsersPasswordPatch,
  updateUserApiV1UsersIdPatch,
} from '../client';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../lib/api-error';

type ProfileScreenProps = {
  onBack: () => void;
};

function formatMemberSince(value?: string | null) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, { dateStyle: 'long' });
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { user, logout, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name ?? '');
    setEmail(user?.email ?? '');
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setProfileError('Email is required.');
      setProfileSuccess(null);
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const { data, error: apiError } = await updateUserApiV1UsersIdPatch({
        path: { id: user.id },
        body: {
          full_name: fullName.trim() || null,
          email: trimmedEmail,
        },
      });
      if (apiError || !data) {
        throw new Error(getApiErrorMessage(apiError, 'Failed to update profile'));
      }
      await refreshUser();
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordError('Current and new password are required.');
      setPasswordSuccess(null);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      setPasswordSuccess(null);
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const { error: apiError } = await updatePasswordApiV1UsersPasswordPatch({
        body: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      });
      if (apiError) {
        throw new Error(getApiErrorMessage(apiError, 'Failed to change password'));
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password changed successfully.');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      const { error: apiError } = await deleteUserApiV1UsersIdDelete({
        path: { id: user.id },
      });
      if (apiError) {
        throw new Error(getApiErrorMessage(apiError, 'Failed to delete account'));
      }
      setShowDeleteConfirm(false);
      await logout();
    } catch (err) {
      setShowDeleteConfirm(false);
      setProfileError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.headerButton}>
            <Text style={styles.headerLink}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Personal details</Text>
            <Text style={styles.sectionHint}>Update your name and email address.</Text>

            <Text style={styles.label}>Full name</Text>
            <TextInput
              autoCapitalize="words"
              autoComplete="name"
              placeholder="Your name"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              editable={!isSavingProfile}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              editable={!isSavingProfile}
            />

            <Text style={styles.label}>Member since</Text>
            <Text style={styles.readOnlyValue}>{formatMemberSince(user.created_at)}</Text>

            {profileError ? <Text style={styles.error}>{profileError}</Text> : null}
            {profileSuccess ? <Text style={styles.success}>{profileSuccess}</Text> : null}

            <Pressable
              style={[styles.primaryButton, isSavingProfile && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Save changes</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Change password</Text>
            <Text style={styles.sectionHint}>Use a strong password you do not use elsewhere.</Text>

            <Text style={styles.label}>Current password</Text>
            <TextInput
              secureTextEntry
              autoComplete="password"
              placeholder="Current password"
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              editable={!isChangingPassword}
            />

            <Text style={styles.label}>New password</Text>
            <TextInput
              secureTextEntry
              autoComplete="new-password"
              placeholder="New password"
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!isChangingPassword}
            />

            <Text style={styles.label}>Confirm new password</Text>
            <TextInput
              secureTextEntry
              autoComplete="new-password"
              placeholder="Confirm new password"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isChangingPassword}
            />

            {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
            {passwordSuccess ? <Text style={styles.success}>{passwordSuccess}</Text> : null}

            <Pressable
              style={[styles.primaryButton, isChangingPassword && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Change password</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Account</Text>

            <Pressable style={styles.secondaryButton} onPress={logout}>
              <Text style={styles.secondaryButtonText}>Sign out</Text>
            </Pressable>

            <Pressable
              style={styles.dangerOutlineButton}
              onPress={() => setShowDeleteConfirm(true)}
              disabled={isDeletingAccount}
            >
              <Text style={styles.dangerOutlineText}>Delete account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Delete account</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to permanently delete your account? All your tasks and data
              will be removed. This cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                style={styles.confirmCancelButton}
                onPress={() => setShowDeleteConfirm(false)}
                disabled={isDeletingAccount}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmDeleteButton, isDeletingAccount && styles.buttonDisabled]}
                onPress={handleDeleteAccount}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    paddingVertical: 4,
    minWidth: 64,
  },
  headerLink: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  headerSpacer: {
    minWidth: 64,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  sectionHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
    fontSize: 16,
    backgroundColor: '#fff',
  },
  readOnlyValue: {
    fontSize: 15,
    color: '#555',
    paddingVertical: 4,
  },
  error: {
    color: '#c62828',
    marginTop: 4,
  },
  success: {
    color: '#2e7d32',
    marginTop: 4,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  dangerOutlineButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#c62828',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dangerOutlineText: {
    color: '#c62828',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
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
