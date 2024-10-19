import { reactive, computed } from 'vue';
import fetcher from "./fetcher";
const cacheMap = reactive(new Map());

export default async function cachedFetcher(url, config, done) {
  config = { ...config };
  const info = await fetcher(url, { ...config, skip: true });
  const key = url;
  const updateCache = () => {
    if (info.data.value !== null && info.data.value !== undefined) {
      cacheMap.set(key, info.data.value);
    }
  };
  const clearCache = () => cacheMap.set(key, undefined);
  const cachedFetch = async () => {
    try {
      await info._fetch(url);
      updateCache();
    } catch (err) {
      clearCache();
      console.error("Error fetching data:", err);
    }
  };
  const cachedData = computed(() => cacheMap.get(key));
  if (cachedData.value == null) {
    await cachedFetch();
  } else {
    info.data.value = cachedData.value;
    info.loading.value = false;

    if (config.revalidate) {
      await cachedFetch();
    }
  }

  if (typeof done === "function") {
    done(cachedData.value);
  }

  return {
    info,
    _fetch: cachedFetch,
    cachedData,
    clear: clearCache
  };
}