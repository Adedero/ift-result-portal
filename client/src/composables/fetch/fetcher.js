import { ref, watch } from "vue";
import useUserStore from "../../stores/user.store";
import errorHandler from "./error-handler";

export default async function fetcher(url, config = options, done) {
  const loading = ref(false);
  const error = ref(null);
  const data = ref(null);
  const status = ref(null);
  const response = ref(null);
  const canAbort = ref(false);
  let timer = null;

  config = {
    ...config
  };

  const _fetch = async function request(api) {
    const headers = {
      'Content-Type': 'application/json' // Default Content-Type for JSON requests
    };

    if (loading.value) return;
    if (!config.router) return;

    let signout;

    // Handle token for authorization
    if (config.sendToken) {
      const userStore = useUserStore();
      const token = userStore.user.token;
      if (!token) {
        config.router.push("/");
        return;
      }
      headers['Authorization'] = 'Bearer ' + token;
      signout = () => {
        localStorage.removeItem(`user-${userStore.user.id}`);
        config.router.push("/");
      };
    }

    // Check if FormData is being sent and remove Content-Type for automatic boundary setting
    let body = config.body;
    if (body) {
      if (config.body instanceof FormData) {
        body = config.body;
        delete headers['Content-Type']; // Let the browser set the correct Content-Type with boundaries
      } else {
        body = JSON.stringify(config.body); // JSON body if not FormData
      }
    }

    const abortController = new AbortController();
    const abort = () => abortController.abort();

    loading.value = true;
    canAbort.value = true;

    if (!config.noTimeout) {
      timer = setTimeout(abort, config.timeout || 1000 * 60);
    }

    const apiWithoutLeadingSlash = api.startsWith('/') ? api.slice(1) : api;
    const URL = config.useBaseUrl
      ? `${import.meta.env.VITE_SERVER_URL}/${apiWithoutLeadingSlash}`
      : `${import.meta.env.VITE_SERVER_URL}/api/${apiWithoutLeadingSlash}`;

    try {
      response.value = await fetch(URL, {
        method: config.method || 'POST', // Ensure method is set correctly
        headers: {
          ...headers,
          ...config.headers
        },
        body: body, // The body now supports FormData without stringifying
        signal: abortController.signal
      });

      const payload = await response.value.json();
      status.value = response.value.status;
      canAbort.value = false;

      if (status.value !== 200) {
        const err = new Error(payload.message || 'An error occurred.');
        err.status = payload.info;
        err.statusCode = status.value;
        throw err;
      }

      if (config.toastOnSuccess) {
        config.toast.add({
          severity: 'success',
          summary: config.successSummary || payload.info,
          detail: config.successDetail || payload.message,
          life: config.toastLife
        });
      }

      data.value = payload;
      error.value = null;
      if (typeof done === 'function') done(data.value);

    } catch (err) {
      console.error(err);
      error.value = err;

      if (err.statusCode === 401) {
        if (signout) signout();
      }

      const isError = errorHandler(err, config.router);
      if (isError) return;

      if (config.toastOnTimeout && err instanceof DOMException && err.name === 'AbortError') {
        config.toast.add({
          severity: 'warn',
          summary: 'Timeout',
          detail: 'Please, check your internet connection and try again',
          life: config.toastLife
        });
        return;
      }

      if (config.toastOnFailure) {
        config.toast.add({
          severity: 'error',
          summary: config.failureSummary || err.status,
          detail: config.failureDetail || err.message,
          life: config.toastLife
        });
      }

    } finally {
      loading.value = false;
      if (timer) clearTimeout(timer);
    }
  };

  if (!config.skip) {
    await _fetch(url);
  }

  watch(() => url, async (newValue) => {
    if (config.refetch) await _fetch(newValue);
  });

  return { response, loading, status, data, error, _fetch };
}
