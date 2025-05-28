import { createHash } from "crypto";
import { readFileSync, statSync } from "fs";
import { resolve } from "path";

const isFile = (filePath: string): boolean => {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
};

export class PasswordValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordValidationError";
  }
}

type Method = "md5" | "sha1" | "sha256" | "sha512";

const hashString =
  (method: Method) =>
  (s = ""): string =>
    createHash(method).update(s).digest("hex");

const md5String = hashString("md5");
const sha1String = hashString("sha1");
const sha256String = hashString("sha256");
const sha512String = hashString("sha512");

const hashWord = (s: string = ""): string[] => [md5String(s), sha1String(s), sha256String(s), sha512String(s)];

const buildWordList = (dict: string): string[] =>
  readFileSync(dict, "utf8")
    .split("\n")
    .filter((a) => a);

const reverseString = (s: string = ""): string => s.split("").reverse().join("");

const defaultWordList = (): string[] => buildWordList(resolve(__dirname, "cracklib-small.txt"));

const trim = (s: string = ""): string => s.trim();

const normalize = (s: string = ""): string => trim(s.toLowerCase());

export const getWords = (dict: string | string[], loose: boolean = false): Set<string> => {
  const words = Array.isArray(dict) ? dict : isFile(dict) ? buildWordList(dict) : [];
  const forward = (words.length > 0 ? words : defaultWordList()).map(loose ? trim : normalize);
  return new Set(loose ? forward : [...forward, ...forward.map(reverseString), ...forward.map(hashWord).flat()]);
};

export const includes = (el: string, xs: Set<string>): boolean => xs.has(el);

export const isBasedOn = (el: string, xs: Set<string>): boolean => {
  const replaced = el
    .toLowerCase()
    .replace("0", "o")
    .replace("1", "l")
    .replace("@", "a")
    .replace("$", "s")
    .replace(/[^a-z]/g, "");
  return includes(replaced, xs);
};
