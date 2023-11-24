const getStyle = (oElm: HTMLElement, strCssRule: string) => {
  let strValue = ''
  if (document.defaultView && document.defaultView.getComputedStyle) {
    strValue = document.defaultView
      .getComputedStyle(oElm, '')
      .getPropertyValue(strCssRule)
  }
  return strValue
}

const getTranslateX = (element: HTMLElement) => {
  const style = window.getComputedStyle(element)
  const matrix = new WebKitCSSMatrix(style.transform)
  return matrix.m41
}

export { getStyle, getTranslateX }
