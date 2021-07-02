; (function (win) {
  window.addEventListener('load', () => {

    const {
      JSON,
      document,
      console,
      confirm,
      location,
      localStorage: store,
      downloadFiles,
    } = win

    if (!downloadFiles) {
      alert('downloadFiles is not defined.')
      return
    }

    const KEYMAP = {
      pdfList: 'GYRB_COLLECTED_PDF_LIST',
      restTimes: 'GYRB_REST_AUTO_CHECK_TIMES',
    }

    const log = log => console.log(`[GYRB] ${log}`)
    const getStorePDFList = () => JSON.parse(store.getItem(KEYMAP.pdfList) || '[]')
    const clearStorePDFList = () => store.removeItem(KEYMAP.pdfList)
    const goNextPage = () => document.getElementById('nextHref').click()

    const collectPagePDFList = () => {
      const list = getStorePDFList()

      document.querySelectorAll('a[href*=pdf]').forEach((link, linkIndex) => {
        const href = link.getAttribute('href')
        if (href.includes('resfile')) {
          const relativeHref = href.split('resfile').reverse()[0]
          const absoluteHref = `http://epaper.gytoday.cn/resfile${relativeHref}`
          if (!list.includes(absoluteHref)) {
            log(`#${linkIndex} Collecting ${absoluteHref}`)
            list.push(absoluteHref)
          }
        } else {
          log(`#${linkIndex} No 'resfile' contained`)
        }
      })

      store.setItem(KEYMAP.pdfList, JSON.stringify(list))
    }

    const startDownload = () => {
      const list = getStorePDFList()

      if (list.length) {
        downloadFiles(list)
        // if (confirm('Clear store PDF list?')) {
        //   clearStorePDFList()
        //   log('PDF list is cleared')
        // }
      } else {
        log('Can not download empty PDF list')
      }
    }

    const run = () => {
      const validDaysInMonth = document.querySelectorAll('font[color]:not([color="silver"])')
      const restAutoCheckTimes = validDaysInMonth.length
      store.setItem(KEYMAP.restTimes, restAutoCheckTimes)
      location.reload()
    }

    const autoCheck = () => {

      const restAutoCheckTimesItem = store.getItem(KEYMAP.restTimes)

      console.clear()

      if (restAutoCheckTimesItem) {
        const restAutoCheckTimes = +restAutoCheckTimesItem
        if (restAutoCheckTimes > 0) {
          log(`Rest auto check times: ${restAutoCheckTimes}`)
          store.setItem(KEYMAP.restTimes, restAutoCheckTimes - 1)
          collectPagePDFList()
          setTimeout(goNextPage, 200)
        } else {
          store.removeItem(KEYMAP.restTimes)
          log('Start downlaod')
          startDownload()
        }
      } else {
        log('Start with gyrb.run()')
      }
    }

    window.gyrb = {
      goNextPage,
      getStorePDFList,
      clearStorePDFList,
      collectPagePDFList,
      startDownload,
      clearStorePDFList,
      run,
      autoCheck,
    }

    autoCheck()

  })

}(window));
