; (function (win) {

  const {
    JSZip,
    saveAs,
  } = win

  if (!JSZip || !saveAs) {
    alert('JSZip or saveAs is not defined.')
    return
  }

  const log = log => console.log(`[DownloadFiles] ${log}`)

  const defaultHandler = fileName => fileName.replace(/\//gi, '_')

  const downloadFiles = (urls, fileNameHandler = defaultHandler) => {

    if (!urls instanceof Array) {
      log('Invalid urls array')
    }

    let handledIndex = 0
    const base64List = []

    const saveFile = () => {
      const zip = new JSZip()
      const folderName = `DownloadFiles_${Date.now()}`
      const folder = zip.folder(folderName)

      base64List.forEach((base64, index) => {
        const url = urls[index]
        const fileName = fileNameHandler(url)
        folder.file(fileName, base64, { base64: true } )
      })

      zip
        .generateAsync({ type: 'blob' })
        .then(content => {
          saveAs(content, folderName + '.zip')
          log('Files zip is downloaded')
        })
    }

    const recursiveFetch = () => {

      const url = urls[handledIndex]

      fetch(url)
        .then(res => res.arrayBuffer())
        .then(buffer => {
          const u8array = new Uint8Array(buffer)
          const mapper = bin => String.fromCharCode(bin)
          const binary = [].slice.call(u8array).map(mapper).join('')
          return window.btoa(binary)
        })
        .then(base64 => {
          base64List.push(base64)
          log(`[${handledIndex + 1}/${urls.length}] ${url} fetched at ${new Date().toLocaleString()}`)

          handledIndex++
          if (handledIndex < urls.length) {
            setTimeout(recursiveFetch, 100)
          } else {
            log(`Preparing to download a zip file`)
            saveFile()
          }
        })
    }

    recursiveFetch()
  }

  window.downloadFiles = downloadFiles

}(window));
