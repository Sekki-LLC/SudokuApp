// File: src/contexts/UserContext.js

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_TOKENS_KEY     = '@sudokuapp:userTokens';
const USER_PURCHASED_KEY  = '@sudokuapp:purchasedItems';

const UserContext = createContext(null);

/**
 * Wrap your app in <UserProvider> so any screen can call useUser()
 */
export function UserProvider({ children }) {
  const [tokens, setTokens] = useState(150);       // new players start with 150
  const [purchasedItems, setPurchasedItems] = useState([]); // ids of unlocked features

  // Load saved tokens + purchases once
  useEffect(() => {
    AsyncStorage.multiGet([USER_TOKENS_KEY, USER_PURCHASED_KEY])
      .then(([[, savedTokens], [, savedPurchased]]) => {
        if (savedTokens != null && !isNaN(Number(savedTokens))) {
          setTokens(Number(savedTokens));
        }
        if (savedPurchased != null) {
          try {
            const parsed = JSON.parse(savedPurchased);
            if (Array.isArray(parsed)) {
              setPurchasedItems(parsed);
            }
          } catch {}
        }
      })
      .catch(console.warn);
  }, []);

  // Persist tokens whenever they change
  useEffect(() => {
    AsyncStorage.setItem(USER_TOKENS_KEY, String(tokens)).catch(console.warn);
  }, [tokens]);

  // Persist purchasedItems whenever they change
  useEffect(() => {
    AsyncStorage.setItem(USER_PURCHASED_KEY, JSON.stringify(purchasedItems)).catch(console.warn);
  }, [purchasedItems]);

  // Add (or subtract) tokens; never go below zero
  const addTokens = delta => {
    setTokens(prev => Math.max(0, prev + delta));
  };

  // Mark an item as purchased (if not already)
  const addPurchasedItem = itemId => {
    setPurchasedItems(prev =>
      prev.includes(itemId) ? prev : [...prev, itemId]
    );
  };

  // Expose both setter in case you need to bulk-restore
  const value = useMemo(() => ({
    tokens,
    addTokens,
    purchasedItems,
    setPurchasedItems,  // for full restores if needed
    addPurchasedItem
  }), [tokens, purchasedItems]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook for screens/components to read or update user tokens/purchases:
 *   const { tokens, addTokens, purchasedItems, addPurchasedItem } = useUser()
 */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}
