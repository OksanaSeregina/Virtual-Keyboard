export default function generate(
  htmlElem,
  classNames,
  children,
  parentElem,
  ...dataAttr
) {
  let elem = null;
  try {
    elem = document.createElement(htmlElem);
  } catch (error) {
    throw new Error("Give the correct html element name");
  }

  if (classNames) elem.classList.add(...classNames.split(" "));

  if (children && Array.isArray(children)) {
    children.forEach(
      (childElement) => childElement && elem.appendChild(childElement)
    );
  } else if (children && typeof children === "object") {
    elem.appendChild(children);
  } else if (children && typeof children === "string") {
    elem.innerHTML = children;
  }

  if (parentElem) {
    parentElem.appendChild(elem);
  }

  if (dataAttr.length) {
    dataAttr.forEach(([attrName, attrValue]) => {
      if (attrValue === "") {
        elem.setAttribute(attrName, "");
      }
      if (
        attrName.match(/value|id|placeholder|cols|rows|autocorrect|spellcheck/)
      ) {
        elem.setAttribute(attrName, attrValue);
      } else {
        elem.dataset[attrName] = attrValue;
      }
    });
  }
  return elem;
}
