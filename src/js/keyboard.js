import * as localSorage from "./local-storage.js";
import generate from "./generate.js";
import languageSelect from "./languages/index-lang.js";
import Key from "./components/key.js";

const main = generate("main", "", [
  generate("h1", "title", "RSS Virtual Keyboard"),
  generate(
    "h3",
    "subtitle",
    "The keyboard was created in the Windows operating system"
  ),
  generate("p", "hint", "To switch the language combination: left ctrl + alt"),
]);

export default class Keyboard {
  constructor(stringSorter) {
    this.stringSorter = stringSorter;
    this.keysPressed = {};
    this.isCaps = false;
  }

  init(langCode) {
    this.keyReference = languageSelect[langCode];
    this.inputField = generate(
      "textarea",
      "inputField",
      null,
      main,
      ["placeholder", "Enter something..."],
      ["rows", 5],
      ["cols", 50],
      ["spellcheck", false],
      ["autocorrect", "off"]
    );
    this.container = generate("div", "keyboard-container", null, main, [
      "language",
      langCode,
    ]);
    document.body.prepend(main);
    return this;
  }

  renderLayout() {
    this.allButtons = [];
    this.stringSorter.forEach((row, i) => {
      const keyboardLine = generate(
        "div",
        "keyboard-line",
        null,
        this.container,
        ["row", i + 1]
      );
      keyboardLine.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
      row.forEach((code) => {
        const keyObj = this.keyReference.find((key) => key.code === code);
        if (keyObj) {
          const keyButton = new Key(keyObj);
          this.allButtons.push(keyButton);
          keyboardLine.appendChild(keyButton.div);
        }
      });
    });

    document.addEventListener("keydown", this.handleEvent);
    document.addEventListener("keyup", this.handleEvent);
    this.container.addEventListener("mousedown", this.preHandleEvent);
    this.container.addEventListener("mouseup", this.preHandleEvent);
  }

  preHandleEvent = (e) => {
    e.stopPropagation();
    const keyDiv = e.target.closest(".item-key");
    if (!keyDiv) return;
    const {
      dataset: { code },
    } = keyDiv;
    keyDiv.addEventListener("mouseleave", this.state);
    this.handleEvent({ code, type: e.type });
  };

  handleEvent = (e) => {
    if (e.stopPropagation) e.stopPropagation();
    const { code, type } = e;
    const keyObj = this.allButtons.find((key) => key.code === code);
    if (!keyObj) return;
    this.inputField.focus();

    if (type.match(/keydown|mousedown/)) {
      if (!type.match(/mouse/)) e.preventDefault();

      if (code.match(/Shift/)) this.shiftKey = true;

      if (this.shiftKey) this.switchRegister(true);

      if (code.match(/Control|Alt|Caps/) && e.repeat) return;

      if (code.match(/Control/)) this.ctrKey = true;
      if (code.match(/Alt/)) this.altKey = true;
      if (code.match(/Control/) && this.altKey) this.switchLanguage();
      if (code.match(/Alt/) && this.ctrKey) this.switchLanguage();

      keyObj.div.classList.add("active");

      if (code.match(/Caps/) && !this.isCaps) {
        this.isCaps = true;
        this.switchRegister(true);
      } else if (code.match(/Caps/) && this.isCaps) {
        this.isCaps = false;
        this.switchRegister(false);
        keyObj.div.classList.remove("active");
      }

      if (!this.isCaps) {
        this.printInput(
          keyObj,
          this.shiftKey ? keyObj.specialCaps : keyObj.mainCaps
        );
      } else if (this.isCaps) {
        if (this.shiftKey) {
          this.printInput(
            keyObj,
            keyObj.specialCharacter.innerHTML
              ? keyObj.specialCaps
              : keyObj.mainCaps
          );
        } else {
          this.printInput(
            keyObj,
            !keyObj.specialCharacter.innerHTML
              ? keyObj.specialCaps
              : keyObj.mainCaps
          );
        }
      }
      this.keysPressed[keyObj.code] = keyObj;
    } else if (e.type.match(/keyup|mouseup/)) {
      this.resetdownButtons(code);
      if (code.match(/Shift/)) {
        this.shiftKey = false;
        this.switchRegister(false);
      }
      if (code.match(/Control/)) this.ctrKey = false;
      if (code.match(/Alt/)) this.altKey = false;

      if (!code.match(/Caps/)) keyObj.div.classList.remove("active");
    }
  };

  stateButton = ({
    target: {
      dataset: { code },
    },
  }) => {
    if (code.match("Shift")) {
      this.shiftKey = false;
      this.switchRegister(false);
      this.keysPressed[code].div.classList.remove("active");
    }
    if (code.match(/Control/)) this.ctrKey = false;
    if (code.match(/Alt/)) this.altKey = false;
    this.resetdownButtons(code);
    this.inputField.focus();
  };

  resetdownButtons = (targetCode) => {
    if (!this.keysPressed[targetCode]) return;
    if (!this.isCaps)
      this.keysPressed[targetCode].div.classList.remove("active");
    this.keysPressed[targetCode].div.removeEventListener(
      "mouseleave",
      this.state
    );
    delete this.keysPressed[targetCode];
  };

  switchRegister(isTrue) {
    if (isTrue) {
      this.allButtons.forEach((button) => {
        if (button.specialCharacter) {
          if (this.shiftKey) {
            button.specialCharacter.classList.add("special-active");
            button.mainCharacter.classList.add("main-active");
          }
        }
        if (
          !button.isKeyFun &&
          this.isCaps &&
          !this.shiftKey &&
          !button.specialCharacter.innerHTML
        ) {
          button.mainCharacter.innerHTML = button.specialCaps;
        } else if (!button.isKeyFun && this.isCaps && this.shiftKey) {
          button.mainCharacter.innerHTML = button.mainCaps;
        } else if (!button.isKeyFun && !button.specialCharacter.innerHTML) {
          button.mainCharacter.innerHTML = button.specialCaps;
        }
      });
    } else {
      this.allButtons.forEach((button) => {
        if (button.specialCharacter.innerHTML && !button.isKeyFun) {
          button.specialCharacter.classList.remove("special-active");
          button.mainCharacter.classList.remove("main-active");
          if (!this.isCaps) {
            button.mainCharacter.innerHTML = button.mainCaps;
          } else if (!this.isCaps) {
            button.mainCharacter.innerHTML = button.specialCaps;
          }
        } else if (!button.isKeyFun) {
          if (this.isCaps) {
            button.mainCharacter.innerHTML = button.specialCaps;
          } else {
            button.mainCharacter.innerHTML = button.mainCaps;
          }
        }
      });
    }
  }

  switchLanguage = () => {
    const langAbbr = Object.keys(languageSelect);
    let langIdx = langAbbr.indexOf(this.container.dataset.languageSelect);
    this.keyReference =
      langIdx + 1 < langAbbr.length
        ? languageSelect[langAbbr[(langIdx += 1)]]
        : languageSelect[langAbbr[(langIdx -= langIdx)]];

    this.container.dataset.languageSelect = langAbbr[langIdx];
    localSorage.set("localLang", langAbbr[langIdx]);

    this.allButtons.forEach((button) => {
      const keyObj = this.keyReference.find((key) => key.code === button.code);
      if (!keyObj) return;
      button.specialCaps = keyObj.specialCaps;
      button.mainCaps = keyObj.mainCaps;
      if (
        keyObj.specialCaps &&
        keyObj.specialCaps.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/g)
      ) {
        button.specialCharacter.innerHTML = keyObj.specialCaps;
      } else {
        button.specialCharacter.innerHTML = "";
      }
      button.mainCharacter.innerHTML = keyObj.mainCaps;
    });
    if (this.isCaps) this.switchRegister(true);
  };

  printInput(keyObj, symbol) {
    let cursorPos = this.inputField.selectionStart;
    const left = this.inputField.value.slice(0, cursorPos);
    const right = this.inputField.value.slice(cursorPos);
    const textHandlers = {
      Tab: () => {
        this.inputField.value = `${left}\t${right}`;
        cursorPos += 1;
      },
      ArrowLeft: () => {
        cursorPos = cursorPos - 1 >= 0 ? cursorPos - 1 : 0;
      },
      ArrowRight: () => {
        cursorPos += 1;
      },
      ArrowUp: () => {
        const positionFromLeft = this.inputField.value
          .slice(0, cursorPos)
          .match(/(\n).*$(?!\1)/g) || [[1]];
        cursorPos -= positionFromLeft[0].length;
      },
      ArrowDown: () => {
        const positionFromLeft = this.inputField.value
          .slice(cursorPos)
          .match(/^.*(\n).*(?!\1)/) || [[1]];
        cursorPos += positionFromLeft[0].length;
      },
      Enter: () => {
        this.inputField.value = `${left}\n${right}`;
        cursorPos += 1;
      },
      Delete: () => {
        this.inputField.value = `${left}${right.slice(1)}`;
      },
      Backspace: () => {
        this.inputField.value = `${left.slice(0, -1)}${right}`;
        cursorPos -= 1;
      },
      Space: () => {
        this.inputField.value = `${left} ${right}`;
        cursorPos += 1;
      },
    };
    if (textHandlers[keyObj.code]) textHandlers[keyObj.code]();
    else if (!keyObj.isKeyFun) {
      cursorPos += 1;
      this.inputField.value = `${left}${symbol || ""}${right}`;
    }
    this.inputField.setSelectionRange(cursorPos, cursorPos);
  }
}
