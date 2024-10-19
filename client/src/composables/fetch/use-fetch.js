import { reactive, computed } from 'vue';
import fetcher from "./fetcher";
import cachedFetcher from './cached-fetcher';

const options = {
  cache: false,
  revalidate: true,
  skip: false,
  router: null,
  toast: null,
  toastLife: 5000,
  refetch: false,
  toastOnSuccess: false,
  successSummary: "",
  successDetail: "",
  toastOnFailure: false,
  failureSummary: "",
  failureDetail: "",
  sendToken: true,
  noTimeout: false,
  timeout: 0,
  toastOnTimeout: true,
  useBaseUrl: false,
  headers: {},
  body: null,
  method: 'GET',
};

const cacheMap = reactive(new Map());

export default async function useFetch(url, config = options, done) {
  config = {
    ...options,
    ...config
  }
  if (config.cache) {
    const request = await cachedFetcher(url, config, done);
    return {
      ...request.info,
      _fetch: request.cachedFetch,
      cache: request.cachedData,
      clear: request.clearCache

    }
  }
  const request = await fetcher(url, config, done);
  return {
    response: request.response,
    loading: request.loading,
    status: request.status,
    data: request.data,
    error: request.error,
    _fetch: request._fetch
  }
}