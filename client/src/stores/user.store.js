import { defineStore } from "pinia";
import { ref } from "vue";

const useUserStore = defineStore("user", () => {
  const user = ref(null);

  const initUser = (userId) => {
    user.value = JSON.parse(localStorage.getId(`user-${userId}`));
  }

  const setUser = (userId, value = {}) => {
    if (!userId) {
      console.error('User ID is required to set the user');
      return;
    }

    const existingUser = localStorage.getItem(`user-${userId}`);
    if (!existingUser) {
      localStorage.setItem(`user-${userId}`, JSON.stringify(value));
      user.value = value;
      return;
    }

    const parsedUser = JSON.parse(existingUser);
    const updatedUser = {
      ...parsedUser,
      ...value
    };

    localStorage.setItem(`user-${userId}`, JSON.stringify(updatedUser));
    user.value = updatedUser;
  };

  return { user, initUser, setUser };
});

export default useUserStore;
