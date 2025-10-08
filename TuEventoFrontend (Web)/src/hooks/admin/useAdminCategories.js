import { useState } from 'react';
import { getAllCategories } from '../../services/CategoryService.js';

export const useAdminCategories = () => {
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  const loadCategories = async () => {
    try {
      setLoadingCategorias(true);
      const result = await getAllCategories();
      if (result.success) {
        setCategorias(result.data);
      } else {
        console.error('Error loading categories:', result.message);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoadingCategorias(false);
    }
  };

  return {
    categorias,
    loadingCategorias,
    loadCategories
  };
};