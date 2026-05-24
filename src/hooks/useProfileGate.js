import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Hook for gating features behind profile completion.
 *
 * Usage:
 *   const { isProfileComplete, guardAction } = useProfileGate();
 *   guardAction(() => doSomething());       // shows toast if incomplete
 *   guardAction(() => doSomething(), true);  // also navigates to /profile
 */
const useProfileGate = () => {
  const { isProfileComplete } = useAuth();
  const navigate = useNavigate();

  const guardAction = useCallback(
    (callback, redirectToProfile = false) => {
      if (isProfileComplete) {
        callback();
      } else {
        toast.error('Complete your profile to unlock this feature 🔒', {
          duration: 4000,
          id: 'profile-incomplete',       // prevents duplicate toasts
          style: { fontWeight: 500 },
        });
        if (redirectToProfile) {
          navigate('/profile');
        }
      }
    },
    [isProfileComplete, navigate]
  );

  return { isProfileComplete, guardAction };
};

export default useProfileGate;
