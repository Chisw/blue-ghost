// twitter
; (function (window) {

  const {
    document,
    console,
    location,
    downloadFiles,
  } = window

  if (!downloadFiles) {
    alert('downloadFiles is not defined.')
    return
  }

  const INTERVAL = 800

  const tt = {
    download() {
      window.scrollTo({ top: 0 })
      fetchTimer = null
      videoLinks = []
      imageLinks = []
      scrolls = []
      let index = 0
      fetchTimer = setInterval(() => {
        document.querySelectorAll('article').forEach(atc => {
          const imgs = atc.querySelectorAll('img')
          imgs.forEach(img => {
            const src = img.getAttribute('src') || ''
            if (src.startsWith('https://pbs.twimg.com/media')) {
              const _src = src.replace(/(name=)\S+/, 'name=orig')
              !imageLinks.includes(_src) && imageLinks.push(_src)
            }
          })
          const svgs = atc.querySelectorAll('svg')
          svgs.forEach(s => {
            const path = s.querySelector('path')
            if (path) {
              const d = path.getAttribute('d')
              if (d.startsWith(`M20.436 11.37L5.904`)) {
                const a = atc.querySelector('a[href*="/status/"]')
                const href = 'https://twitter.com' + a.getAttribute('href')
                !videoLinks.includes(href) && videoLinks.push(href)
              }
            }
          })
        })
        console.log('Find', imageLinks.length, 'P and', videoLinks.length, 'V in', index, 'times.')
        index++
        window.scrollTo({ top: index * 1000, behavior: 'smooth' })
        scrolls.unshift(document.documentElement.scrollTop)
        if (scrolls.slice(0, 3).join('') === String(scrolls[0]).repeat(3) && !document.querySelector('[role=progressbar]')) {
          clearInterval(fetchTimer)
          downloadFiles(imageLinks, url => {
            return url
              .split('?')
              .map((s, index) => index ? s.split(/=|&/)[1] : s.split('/').reverse()[0])
              .join('.')
          })
          const str = videoLinks.filter(Boolean).join('\n')
          console.log(str)
          const input = document.createElement('textarea')
          document.body.appendChild(input)
          input.setAttribute('style', 'position:fixed;top:0;left:0;z-index:999;')
          input.value = str
          input.onfocus = () => {
            input.select()
            const result = document.execCommand('copy')
            console.log('Urls copied', result, '.')
            document.body.removeChild(input)
          }
        }
      }, INTERVAL)
    },
    unlike() {
      window.scrollTo({ top: 0 })
      fetchTimer = null
      scrolls = []
      let index = 0
      fetchTimer = setInterval(() => {
        document.querySelectorAll(`[data-testid="unlike"]`).forEach(b => b.click())
        index++
        window.scrollTo({ top: index * 1000, behavior: 'smooth' })
        scrolls.unshift(document.documentElement.scrollTop)
        if (scrolls.slice(0, 3).join('') === String(scrolls[0]).repeat(3) && !document.querySelector('[role=progressbar]')) {
          clearInterval(fetchTimer)
          location.reload()
        }
      }, INTERVAL)
    },
  }

  window.tt = tt
 
}(window));