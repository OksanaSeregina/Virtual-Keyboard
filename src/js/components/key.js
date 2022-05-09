import generate from "../generate.js";

export default class Key {
  constructor({ mainCaps, specialCaps, code }) {
    this.code = code;
    this.mainCaps = mainCaps;
    this.specialCaps = specialCaps;
    this.isKeyFun = Boolean(
      mainCaps.match(/Ctrl|arr|Alt|Shift|Tab|Back|Del|Enter|Caps|Win/)
    );

    if (specialCaps && specialCaps.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/)) {
      this.specialCharacter = generate(
        "div",
        "specialCharacter",
        this.specialCaps
      );
    } else {
      this.specialCharacter = generate("div", "specialCharacter", "");
    }

    this.mainCharacter = generate("div", "mainCharacter", mainCaps);
    this.div = generate(
      "div",
      "item-key",
      [this.specialCharacter, this.mainCharacter],
      null,
      ["code", this.code],
      this.isKey ? ["fn", "true"] : ["fn", "false"]
    );
  }
}
