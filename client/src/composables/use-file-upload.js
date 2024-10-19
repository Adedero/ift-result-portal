import useFetch from "@/composables/fetch/use-fetch";

const useFileUpload = async (api, files = [], config = {}, done) => {
  config = {
    ...config,
    method: "POST"
  };

  // Create a new FormData instance
  const form = new FormData();

  // Append each file to the form
  files.forEach((file, index) => {
    form.append(`file-${index + 1}`, file); // Appending files with an index
  });

  // If there's additional data (not files), append it to the form
  if (config.body && typeof config.body === 'object') {
    form.append('data', JSON.stringify(config.body)); // Serialize the body to JSON if needed
  }

  // Set the form as the request body
  config.body = form;

  // Call the useFetch function
  const { loading, error, data } = await useFetch(
    api,
    config, // Just pass config directly, no need for reassignment
    (data) => {
      if (typeof done === 'function') done(data); // Call the callback if defined
    }
  );

  return { loading, error, data }; // Return loading, error, and data from useFetch
};

export default useFileUpload;
