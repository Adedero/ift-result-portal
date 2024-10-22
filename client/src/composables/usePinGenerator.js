import useFetch from "./fetch/use-fetch";

const usePinGenerator = () => {
  return {
    generatePin: async (role, validity = "1 hour", amount = 1, options = {}) => {
      if (!role) return;
      options = {
        ...options,
        method: "POST"
      }
      const { error, data } = await useFetch(
        `/admin/generate-pin?role=${role}&validity=${validity}&amount=${amount}`,
        options,
      );
      return { error: error.value, data: data.value };
    },

    deletePins: async (options) => {
      options = {
        ...options,
        method: "PUT"
      }
      const { error, data } = await useFetch(
        `/admin/delete-pins`,
        options
      );
      return { error: error.value, data: data.value }
    },


    checkPinValidity: async (pin, options = {}) => {
      if (!pin) return;
      options = {
        ...options,
        method: "GET"
      }
      const { error, data } = await useFetch(
        `/auth/check-pin-validity/${pin}`,
        options
      );
      return { error: error.value, data: data.value }
    }
  }
}

export default usePinGenerator;