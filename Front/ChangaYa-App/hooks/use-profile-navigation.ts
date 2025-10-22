import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { MOCK_CURRENT_USER } from '@/constants/mock-auth';

export const useProfileNavigation = () => {
  const router = useRouter();

  const goToProfile = useCallback(
    (userId?: string) => {
      if (!userId || userId === MOCK_CURRENT_USER.id) {
        router.push({ pathname: '/profile' });
        return;
      }

      router.push({ pathname: '/profile/[id]', params: { id: userId } });
    },
    [router],
  );

  return {
    goToProfile,
    currentUser: MOCK_CURRENT_USER,
    currentUserId: MOCK_CURRENT_USER.id,
  };
};