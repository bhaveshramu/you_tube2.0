const badWords = [
  "idiot",
  "stupid",
  "fool",
  "damn",
  "hate",
];

export const containsBadWords = (text) => {
  const comment = text.toLowerCase();
  return badWords.some(word => comment.includes(word));
};

export const isSpam = (text) => {
  const words = text.toLowerCase().trim().split(/\s+/);

  // Example:
  // buy buy buy buy buy

  if (words.length >= 5) {
    const uniqueWords = new Set(words);
    if (uniqueWords.size <= 2) return true;
  }

  return false;
};

export const hasRepeatedSpecialCharacters = (text) => {
  return /([!@#$%^&*()_+=\-{}[\]|\\:;"'<>,.?/~`])\1{4,}/.test(text);
};