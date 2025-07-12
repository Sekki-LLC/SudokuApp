// File: src/contexts/UserContext.js

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_TOKENS_KEY = '@sudokuapp:userTokens';
const USER_PURCHASED_KEY = '@sudokuapp:purchasedItems';

// Create context with a null default so we can error on missing provider
const UserContext = createContext(null);

/**
 * Wrap your app in <UserProvider> so any screen can call useUser()
 */
export function UserProvider({ children }) {
  const [tokens, setTokens] = useState(150);       // new players start with 150
  const [purchasedItems, setPurchasedItems] = useState([]); // ids of unlocked features

  // Load saved token count and purchased items on mount
  useEffect(() => {
    AsyncStorage.multiGet([USER_TOKENS_KEY, USER_PURCHASED_KEY])
      .then(([ [ , savedTokens ], [ , savedPurchased ] ]) => {
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

  // Persist tokens
  useEffect(() => {
    AsyncStorage.setItem(USER_TOKENS_KEY, String(tokens)).catch(console.warn);
  }, [tokens]);

  // Persist purchasedItems
  useEffect(() => {
    AsyncStorage.setItem(USER_PURCHASED_KEY, JSON.stringify(purchasedItems)).catch(console.warn);
  }, [purchasedItems]);

  // Add (or subtract) tokens; never let it go below 0
  const addTokens = delta => {
    setTokens(prev => Math.max(0, prev + delta));
  };

  // Mark an item as purchased (if not already)
  const addPurchasedItem = itemId => {
    setPurchasedItems(prev => prev.includes(itemId) ? prev : [...prev, itemId]);
  };

  // Memoize the context value to avoid unnecessary re-renders
  const value = useMemo(() => ({
    tokens,
    addTokens,
    purchasedItems,
    setPurchasedItems,
    addPurchasedItem
  }), [tokens, purchasedItems]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Call this hook from any screen to read/add tokens or purchased items:
 *   const { tokens, addTokens, purchasedItems, addPurchasedItem } = useUser()
 */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}
