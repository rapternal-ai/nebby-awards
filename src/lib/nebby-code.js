const ALPHANUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateNebbyCode(seed) {
  const input = String(seed);
  let hash = 0x811c9dc5;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  let value = hash;
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    code += ALPHANUM[value % ALPHANUM.length];
  }

  return code;
}

module.exports = {
  generateNebbyCode,
};
