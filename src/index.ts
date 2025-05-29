import { Cracklib, type CracklibParams } from "./cracklib";

const cracklib = (c?: CracklibParams): ((w?: string) => string | Error) => {
  const cl = new Cracklib({ ...c, compatibilityMode: true });
  return (word = "") => cl.validate(word);
};

export default cracklib;
