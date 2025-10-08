import { useState, useEffect } from 'react';
import { getUserById } from '../../services/Login.js';

export const useAdminProfile = () => {
  const [adminData, setAdminData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadAdminProfile = async () => {
    try {
      setLoadingProfile(true);
      const adminUserID = localStorage.getItem('userID');
      if (adminUserID) {
        const result = await getUserById(adminUserID);
        if (result.success) {
          setAdminData(result.data);
        } else {
          console.error('Error loading admin profile:', result.message);
        }
      }
    } catch (err) {
      console.error('Error loading admin profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadAdminProfile();
  }, []);

  return {
    adminData,
    loadingProfile,
    loadAdminProfile
  };
};