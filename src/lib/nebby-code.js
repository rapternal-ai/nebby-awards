function generateNebbyCode(seed) {
  const input = String(seed);
  let hash = 2166136261;

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  let state = hash >>> 0;

  for (let i = 0; i < 6; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    code += chars[state % chars.length];
  }

  return code;
}

module.exports = { generateNebbyCode };
