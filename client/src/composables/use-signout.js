import useUserStore from "../stores/user.store";
export default function useSignout(router) {
  router = router;
  const userStore = useUserStore();
  localStorage.removeItem(`user-${userStore.user.id}`);
  if (router) {
    router.push("/");
  }
}
