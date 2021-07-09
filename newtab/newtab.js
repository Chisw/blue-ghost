; (function () {
  const json = localStorage.getItem('BLUE_GHOST_CONFIG')
  if (json) {
    const { newTabUrl } = JSON.parse(json)
    newTabUrl && document.getElementById('iframe').setAttribute('src', newTabUrl)
  }
}());