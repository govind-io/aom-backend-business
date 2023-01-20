export default function generateUniqueString(username) {
  const timestamp = new Date().getTime();
  return `${username}${timestamp}`
    .split("")
    .reduce((acc, char) => {
      acc += char.charCodeAt(0);
      return acc;
    }, 0)
    .toString(36)
    .slice(-6);
}
