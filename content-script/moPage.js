; (function (window) {

  const {
    chrome,
    location,
  } = window

  window.addEventListener('load', () => {

    chrome.runtime.sendMessage({
      method: 'getLocalStorage',
      key: 'BLUE_GHOST_CONFIG',
    }, res => {
      if (res.data.moPageList.includes(location.host)) {

        const style = document.createElement('style')
        style.innerHTML = `
          html {
            opacity: 0;
          }
          html:hover {
            opacity: 1;
            transition: opacity 1s;
          }
        `

        const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
        link.type = 'image/x-icon'
        link.rel = 'shortcut icon'
        link.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABaFBMVEUAAACKioqCgoJ2dnZ2dnaCgoJ1dXWQkJB7e3t5eXl9fX2Kiop4eHiIiIiLi4t9fX2Hh4d3d3eJiYmNjY2Dg4OKiop6enqNjY13d3eOjo6QkJCOjo6IiIiAgIB/f392dnZ2dnaPj4+Hh4eRkZF+fn51dXWNjY12dnaEhISKioqCgoKBgYFzc3Nzc3OIiIh9fX1zc3N+fn55eXl3d3eOjo6Hh4eMjIz///92dnZ4eHiBgYF6enqDg4P9/f19fX1ycnJ1dXV8fHyGhoaFhYWKioqAgICIiIhwcHCRkZGNjY1/f390dHSOjo75+fmcnJyMjIxqamqZmZmUlJRnZ2eenp6Xl5fx8fHj4+PMzMzCwsKQkJBtbW1lZWX19fXe3t7R0dGysrKoqKjt7e3o6Oi+vr61tbWrq6ukpKSbm5tiYmJgYGBaWlrz8/Pq6url5eXc3NzZ2dnU1NTGxsa6urpeXl7g4ODW1tajo6NJe9igAAAAN3RSTlMA9BubIxT29fXloJ8vLiIN9fLm5NzLy8bGm4xdXfj15Nzb09LS0qWlopqOjo2LiopeXV1cKR4NlMk7cgAAAqFJREFUOMtlk2V72zAURpWmzAxrx8w8ybItyyBzEzdMbZIyd4Vtf3/XTldYzwfpefwe29f3yuiank/p+YcTEwPz6S896C7d6V4CSIAs9w8O/5+/5/wqB3T94+3bn5MELQFinbFn3df5cG8SOw7xMhlXB4Ux5j+4ek1XnEua452tY6BUWQkC4fviftel8CjJtSoGVg9VWJssoELQ6U7+LsmDNYzLGZLP89wpxusGp5Qqb5IC45w7Jxi3D/Yjx4n2DooqLsmSAkb8kpeQS84WxisHDhW+oIq0b6q4yamiKK8QGpMgD3wVn18QEki+YJxIjT8YF4mpmOYY+hq3RtvChw2tuNniMuPt6o7UKOMKMU3TWEJpEIh2gjejIpR/xnkLtu36Ni4xYRrGEJqF1gZSCRfqFQzoQQnWclDDqisbhjGDBmQQxDIuOm1INjStCdum5ql4RTJsexL1g8BB2OX51tFvnei8clR1JDcWbNtOgaDr3F/GGSLvNS7qhq3t5/dkHYRiRxiAyXEBQqAIrpuKYlDJtJMnyLZtTaJZmCyhIHBoXIJhG4acCJZlzaBB1hEKICSGaULxeu5SGEKfme93BFMicW9saFw2EXTLyi6iMeYLosQCy1RbVDHFdrVNY2GXZbPeD4QGhSAmfCYh53iVUIP8wk3CoIYC87wXMM3vlEqKCkUGW3iVQt83YAxyCFeYF44i4C2lThkfu7l16HGu9hOO1Q6sy9QO76GEaUPL4hgV39h2NPfxv0M7bkTemqquCRPW4xw5VdWNQhT2daFLRsbtqMFYvl7P+yKKnLyvOJCPoCtGn1i+49AwVDSN1lybBEru6Si6yQcrm4XGeWEt9LzQdV2o7zYjQykQQIM87Fv4hu7Ss/R6biqVmppbWLzx+/8FESfQuY5UlboAAAAASUVORK5CYII='

        document.body.appendChild(style)
        document.title = `MoPage - BlueGhost - ${document.title}`
        document.getElementsByTagName('head')[0].appendChild(link)
      }
    })

  })
}(window));