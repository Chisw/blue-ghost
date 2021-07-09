; (function (window) {

  const {
    chrome,
    location,
  } = window

  window.addEventListener('load', () => {

    const style = document.createElement('style')

    style.innerHTML =  `
      html {
        opacity: 0;
      }
      html:hover {
        opacity: 1;
        transition: opacity 1s;
      }
    `

    chrome.runtime.sendMessage({
      method: 'getLocalStorage',
      key: 'BLUE_GHOST_CONFIG',
    }, res => {
      if (res.data.moPageList.includes(location.host)) {
        document.body.appendChild(style)
        document.title = `BlueGhost - ${document.title}`
      }
    })

  })
}(window));