import { create } from 'zustand';

const LOCAL_STORAGE_KEY = 'chatHistories';

export const useCharacterStore = create((set, get) => ({
  characters: [],
  selectedCharacter: null,
  loading: false,
  error: null,

  // Store chat history per characterId
  chatHistories: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}'),

  fetchCharacters: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('https://fastapi-characters-ywlm.onrender.com/characters');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      set({ characters: data, loading: false });
    } catch (err) {
      console.error(err);
      set({ error: err.message, loading: false });
    }
  },

  selectCharacter: (character) => set({ selectedCharacter: character }),

  // Save message to chat history
  addMessage: (characterId, message) => {
    const { chatHistories } = get();
    const updatedHistory = chatHistories[characterId]
      ? [...chatHistories[characterId], message]
      : [message];
    const newHistories = { ...chatHistories, [characterId]: updatedHistory };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistories));
    set({ chatHistories: newHistories });
  },

  // Load messages for a character
  getMessages: (characterId) => {
    const { chatHistories } = get();
    return chatHistories[characterId] || [];
  },

  // Clear all chats for a character (optional)
  clearChat: (characterId) => {
    const { chatHistories } = get();
    const newHistories = { ...chatHistories, [characterId]: [] };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistories));
    set({ chatHistories: newHistories });
  },
}));
