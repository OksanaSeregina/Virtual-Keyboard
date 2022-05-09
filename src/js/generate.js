export default function generate(
  htmlElem,
  classNames,
  children,
  parentElem,
  ...dataAttr
) {
  let element = null;
  try {
    element = document.createElement(htmlElem);
  } catch (error) {
    throw new Error("Give the correct html element name");
  }

  if (classNames) element.classList.add(...classNames.split(" "));

  if (children && Array.isArray(children)) {
    children.forEach(
      (childElement) => childElement && element.appendChild(childElement)
    );
  } else if (children && typeof children === "object") {
    element.appendChild(children);
  } else if (children && typeof children === "string") {
    element.innerHTML = children;
  }

  if (parentElem) {
    parentElem.appendChild(element);
  }

  if (dataAttr.length) {
    dataAttr.forEach(([attrName, attrValue]) => {
      if (attrValue === "") {
        element.setAttribute(attrName, "");
      }
      if (
        attrName.match(/value|id|placeholder|cols|rows|autocorrect|spellcheck/)
      ) {
        element.setAttribute(attrName, attrValue);
      } else {
        element.dataset[attrName] = attrValue;
      }
    });
  }
  return element;
}
