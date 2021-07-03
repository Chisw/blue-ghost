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

  const downloadFiles = (urls, fileNameHandler = encodeURIComponent) => {

    const downloadPromise = new Promise((resolve, reject) => {

      if (!urls instanceof Array) {
        const errorInfo = 'Invalid urls array.'
        log(errorInfo)
        reject(errorInfo)
      }

      let handledIndex = 0
      const base64List = []

      const saveFile = () => {
        log('Start to zip.')
        const zip = new JSZip()
        const folderName = `DownloadFiles_${Date.now()}`
        const folder = zip.folder(folderName)

        base64List.forEach((base64, index) => {
          const url = urls[index]
          const fileName = fileNameHandler(url)
          folder.file(fileName, base64, { base64: true })
          log(`[${index + 1}/${base64List.length}] is zipped.`)
        })

        log(`Preparing to generate and download the zip file.`)

        zip
          .generateAsync({ type: 'blob' })
          .then(content => {
            log(`Zip file is generated.`)
            saveAs(content, folderName + '.zip')
            const successInfo = `Zip file is downloaded (${folderName}.zip).`
            log(successInfo)
            resolve(successInfo)
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
            log(`[${handledIndex + 1}/${urls.length}] ${url} fetched at ${new Date().toLocaleString()}.`)

            handledIndex++
            if (handledIndex < urls.length) {
              setTimeout(recursiveFetch, 100)
            } else {
              saveFile()
            }
          })
      }

      recursiveFetch()

    })

    return downloadPromise
  }

  window.downloadFiles = downloadFiles

}(window));
