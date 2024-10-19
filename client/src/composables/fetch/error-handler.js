export default function errorHandler(err, router) {
  if (err.statusCode === 401) {
    router.push("/");
    return err;
  }
  if (err.statusCode === 403) {
    router.push("/403");
    return err;
  }
  if (err.statusCode === 404) {
    router.push("/404");
    return err;
  }
  return null;
}