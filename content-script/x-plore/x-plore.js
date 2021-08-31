; (function () {

  const { host, search } = location

  if (host.startsWith('192.168') && search === '?x') {
    const style = document.createElement('style')
    style.innerText = window.injectStyleContent
    document.body.appendChild(style)
  }

}());
