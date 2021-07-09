; (function (window) {

  const {
    localStorage,
    chrome,
  } = window

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    const {
      method,
      key,
    } = request

    if (method === 'getLocalStorage') {
      const storage = localStorage.getItem(key)
      sendResponse({ data: storage ? JSON.parse(storage) : null })
    } else {
      sendResponse({})
    }
  })

}(window));