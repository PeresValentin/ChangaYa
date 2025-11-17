import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type StoredUserShape = {
  id?: string | number;
  _id?: string | number;
  usuarioID?: string | number;
  usuarioId?: string | number;
  userId?: string | number;
};

const extractUserId = (rawUser: unknown): string | null => {
  if (!rawUser || typeof rawUser !== 'object') {
    return null;
  }

  const candidate =
    (rawUser as StoredUserShape).id ??
    (rawUser as StoredUserShape)._id ??
    (rawUser as StoredUserShape).usuarioID ??
    (rawUser as StoredUserShape).userId ??
    (rawUser as StoredUserShape).usuarioId;

  return candidate ? String(candidate) : null;
};

export const useProfileNavigation = () => {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser) as unknown;
        const extractedId = extractUserId(parsedUser);
        if (extractedId) {
          setCurrentUserId(extractedId);
        }
      } catch (error) {
        console.error('Error al recuperar el usuario desde AsyncStorage', error);
      }
    };

    loadUser();
  }, []);

  const goToProfile = useCallback(
    (userId?: string | null) => {
      if (!userId || (currentUserId && userId === currentUserId)) {
        router.push('/profile');
        return;
      }

      router.push({ pathname: '/profile/[id]', params: { id: userId } });
    },
    [currentUserId, router],
  );

  return {
    goToProfile,
    currentUserId,
  };
};