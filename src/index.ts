import { PasswordValidationError, getWords, includes, isBasedOn } from "./util";

const cracklib = ({ dict = "/usr/share/dict/words", minLength = 8, loose = false } = {}): ((
  w?: string
) => string | Error) => {
  const words = getWords(dict, loose);
  return (word = "") => {
    if (!word.length || /^\s+$/.test(word)) {
      throw new PasswordValidationError("Password is empty or all whitespace");
    }
    if (word.length < minLength) {
      throw new PasswordValidationError("Password is too short");
    }
    if (includes(word, words)) {
      throw new PasswordValidationError("Password is too common");
    }
    if (isBasedOn(word, words)) {
      throw new PasswordValidationError("Password is too similar to a dictionary word");
    }
    return word;
  };
};

export default cracklib;
