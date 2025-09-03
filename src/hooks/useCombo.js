import { useState, useEffect } from 'react';
import { fetchComboWithItems } from '../services/comboService';

export const useCombo = (comboId) => {
  const [combo, setCombo] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCombo = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Loading combo with ID: ${comboId}`);
        
        const data = await fetchComboWithItems(comboId);
        console.log('Combo data received:', data);
        
        if (!data) {
          throw new Error('No data received from server');
        }
        
        if (!data.combo) {
          throw new Error('Combo data is missing from response');
        }
        
        setCombo(data.combo);
        setAvailableItems(data.availableItems || []);
      } catch (err) {
        console.error('Error loading combo:', err);
        setError(err.message);
        setCombo(null);
        setAvailableItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (comboId) {
      loadCombo();
    } else {
      setLoading(false);
      setCombo(null);
      setAvailableItems([]);
    }
  }, [comboId]);

  return { combo, availableItems, loading, error };
};