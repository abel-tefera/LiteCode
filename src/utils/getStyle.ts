const getStyle = (oElm: any, strCssRule: any) => {
  let strValue = "";
  if (document.defaultView && document.defaultView.getComputedStyle) {
    strValue = document.defaultView
      .getComputedStyle(oElm, "")
      .getPropertyValue(strCssRule);
  } else if (oElm.currentStyle) {
    strCssRule = strCssRule.replace(
      /\-(\w)/g,
      function (strMatch: any, p1: any) {
        return p1.toUpperCase();
      }
    );
    strValue = oElm.currentStyle[strCssRule];
  }
  return strValue;
};

const getTranslateX = (element: any) => {
  const style = window.getComputedStyle(element);
  const matrix = new WebKitCSSMatrix(style.transform);
  return matrix.m41;
};

export { getStyle, getTranslateX };
