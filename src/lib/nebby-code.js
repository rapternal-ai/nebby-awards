const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateNebbyCode(seed) {
  const input = String(seed);
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  let code = "";
  for (let i = 0; i < 6; i += 1) {
    hash = (Math.imul(hash ^ (i + 1), 1664525) + 1013904223) >>> 0;
    code += ALPHABET[hash % ALPHABET.length];
  }

  return code;
}

module.exports = { generateNebbyCode };
