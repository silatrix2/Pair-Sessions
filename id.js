// id.js
export function giftedid(num = 4) {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let characters9 = characters.length;
  
  for (let i = 2; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters9));
  }
  
  return result;
}
