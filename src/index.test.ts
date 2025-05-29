import * as fs from "fs";
import { resolve } from "path";
import test from "tape";
import crack from ".";
import { Cracklib } from "./cracklib";

const fakePath = resolve(__dirname, "not-real.txt");

test("cracklibjs", (t) => {
  const okWord = "alksdfjlkj1232345sdlkjcs8!!";
  t.equals(crack()(okWord), okWord, "random word is ok, no options");
  t.equals(crack({})(okWord), okWord, "random word is ok, empty options");
  t.equals(typeof crack(), "function", "crack() returns a function");
  t.throws(() => crack({ minLength: 9 })("asdf11!!"), /Password is too short/, "crack with minLength fails");
  t.throws(() => crack()(""), /Password is empty or all whitespace/, "empty password fails");
  t.throws(() => crack()(), /Password is empty or all whitespace/, "no password fails");
  t.throws(() => crack()("\t   \n"), /Password is empty or all whitespace/, "whitespace password fails");
  t.throws(() => crack({ minLength: 2 })("one"), /Password is too common/, 'crack with "one" fails');
  t.throws(() => crack({ minLength: 2 })("eno"), /Password is too common/, 'crack with "eno" (reversed "one") fails');
  t.throws(
    () => crack()("abandon#ment"),
    /Password is too similar to a dictionary word/,
    'crack with "abandon#ment" fails'
  );
  t.equals(crack({ minLength: 2, loose: true })("eno"), "eno", 'crack with "eno" is okay with loose option');
  t.equals(crack({ dict: fakePath })(okWord), okWord, "works with broken path");
  t.equals(new Cracklib().validate(okWord), okWord, "works with default Cracklib instance");
  t.throws(
    () => new Cracklib({ dict: fakePath }).validate(okWord),
    /ENOENT/,
    "Cracklib with broken path throws on empty password"
  );
  t.throws(
    () => new Cracklib({ dict: ["hello", "world"], minLength: 1 }).validate("hello"),
    /Password is too common/,
    "Cracklib with array dict fails on common word"
  );
  t.equals(
    new Cracklib({ dict: ["hello", "world"], minLength: 1 }).validate("olleh"),
    "olleh",
    "Cracklib with array dict passes on non-common word"
  );
  t.true(() => {
    try {
      const cl = new Cracklib({ dict: ["hello", "world"], minLength: 1 });
      cl.saveDictionary("test.json");
      const reread = JSON.parse(fs.readFileSync(resolve("test.json"), "utf8"));
      return reread.includes("hello") && reread.includes("world") && reread.length === 2;
    } finally {
      try {
        fs.unlinkSync(resolve("test.json"));
      } catch (e) {}
    }
  }, "Cracklib with array dict saves dictionary");
  t.throws(
    () => {
      try {
        const cl = new Cracklib({ dict: ["hello", "world"], minLength: 1 });
        cl.saveDictionary("test.json");
        const cl2 = new Cracklib({ dict: "test.json", minLength: 1 });
        return cl2.validate("hello");
      } finally {
        try {
          fs.unlinkSync(resolve("test.json"));
        } catch (e) {}
      }
    },
    /Password is too common/,
    "Cracklib with saved dict fails on common word"
  );
  t.throws(
    () => {
      try {
        const cl = new Cracklib({ dict: ["hello", "world"], minLength: 1 });
        cl.saveDictionary("test.notjson");
      } finally {
        try {
          fs.unlinkSync(resolve("test.notjson"));
        } catch (e) {}
      }
    },
    /must end with .json/,
    "Cracklib saveDictionary fails on non-json filename"
  );
  t.end();
});
