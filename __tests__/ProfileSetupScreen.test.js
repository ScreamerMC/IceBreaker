import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { doc, setDoc } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import { db, storage, auth } from '../../firebaseConfig';

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('../firebaseConfig', () => ({
  db: jest.fn(),
  storage: jest.fn(),
  auth: { currentUser: { uid: 'testUserId' } },
}));

jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: { alert: jest.fn() },
}));

describe('ProfileSetupScreen', () => {
  let navigation;

  beforeEach(() => {
    navigation = { replace: jest.fn() };
    jest.clearAllMocks();
  });

  it('displays an alert if mainImage is not set', async () => {
    const { getByText } = render(<ProfileSetupScreen navigation={navigation} />);

    const saveButton = getByText('Save Profile');
    fireEvent.press(saveButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Profile Incomplete',
      'Please upload a main profile picture.'
    );
  });

  it('displays an alert if gender or preference is not selected', async () => {
    const { getByText, getByPlaceholderText } = render(
      <ProfileSetupScreen navigation={navigation} />
    );

    const mainImageMock = 'mockMainImageUri';
    const textInput = getByPlaceholderText('Tell us a bit about yourself...');
    fireEvent.changeText(textInput, 'This is a bio.');

    const saveButton = getByText('Save Profile');
    fireEvent.press(saveButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Profile Incomplete',
      'Please select your gender and who you\'re interested in.'
    );
  });

  it('uploads images and saves profile successfully', async () => {
    uploadBytes.mockResolvedValue();
    getDownloadURL.mockResolvedValue('https://mockdownloadurl.com/image.jpg');
    setDoc.mockResolvedValue();

    const { getByText, getByPlaceholderText } = render(
      <ProfileSetupScreen navigation={navigation} />
    );

    const mainImageMock = 'mockMainImageUri';
    const textInput = getByPlaceholderText('Tell us a bit about yourself...');
    fireEvent.changeText(textInput, 'This is a bio.');

    const saveButton = getByText('Save Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(uploadBytes).toHaveBeenCalledTimes(1);
      expect(setDoc).toHaveBeenCalledWith(
        doc(db, 'users', auth.currentUser.uid),
        expect.objectContaining({
          mainImage: 'https://mockdownloadurl.com/image.jpg',
          bio: 'This is a bio.',
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Profile Created',
        'Welcome to ICEBREAKER!'
      );
      expect(navigation.replace).toHaveBeenCalledWith('Swipe');
    });
  });

  it('displays an alert if there is an error saving the profile', async () => {
    uploadBytes.mockRejectedValue(new Error('Upload error'));
    setDoc.mockRejectedValue(new Error('Firestore error'));

    const { getByText, getByPlaceholderText } = render(
      <ProfileSetupScreen navigation={navigation} />
    );

    const mainImageMock = 'mockMainImageUri';
    const textInput = getByPlaceholderText('Tell us a bit about yourself...');
    fireEvent.changeText(textInput, 'This is a bio.');

    const saveButton = getByText('Save Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to save profile. Please try again.'
      );
    });
  });
});
