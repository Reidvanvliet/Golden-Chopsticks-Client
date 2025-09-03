import { useState, useEffect } from 'react';
import { comboAPI } from '../services/api';

export const useMenuData = (categories, activeCategory) => {
  const [combos, setCombos] = useState([]);
  const [loadingCombos, setLoadingCombos] = useState(true);

  // Set first category as active if none selected
  useEffect(() => {
    if (!activeCategory && categories && categories.length > 0) {
      // This would need to be handled by parent component
      // setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Load combos
  useEffect(() => {
    const loadCombos = async () => {
      try {
        setLoadingCombos(true);
        const comboData = await comboAPI.getAllCombos();
        setCombos(comboData || []);
      } catch (error) {
        console.error('Error loading combos:', error);
        setCombos([]);
      } finally {
        setLoadingCombos(false);
      }
    };

    loadCombos();
  }, []);

  return {
    combos,
    loadingCombos
  };
};