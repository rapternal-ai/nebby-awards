function generateNebbyCode(seed) {
  const input = String(seed);
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  let value = hash;

  for (let i = 0; i < 6; i += 1) {
    value = (value * 1664525 + 1013904223) >>> 0;
    code += alphabet[value % alphabet.length];
  }

  return code;
}

module.exports = { generateNebbyCode };