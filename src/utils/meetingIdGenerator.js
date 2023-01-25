export default function generateRandomString(secretKey) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 9; i++) {
    result += characters.charAt(
      (Math.floor(Math.random() * characters.length) +
        secretKey.charCodeAt(i % secretKey.length)) %
        characters.length
    );
    if ((i + 1) % 3 === 0 && i !== 8) {
      result += "-";
    }
  }

  return result;
}
