; (function () {
  const json = localStorage.getItem('BLUE_GHOST_CONFIG')
  if (json) {
    const { newTab } = JSON.parse(json)
    newTab && document.getElementById('iframe').setAttribute('src', newTab)
  }
}());