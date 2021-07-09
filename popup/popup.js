; (function (window) {

  const {
    chrome,
    document,
    localStorage,
    getStringPinyin,
    getDuoyinHandledStrList,
  } = window

  const CONFIG_KEY = 'BLUE_GHOST_CONFIG'
  const DEFAULT_CONFIG = {
    version: '0.1.0',
    activeTab: 'bookmark',
    newTabUrl: '',
    moPageList: [],
  }
  // localStorage.removeItem(CONFIG_KEY)

  window.addEventListener('load', () => {

    new Vue({
      el: '#blue-ghost-popup',
    
      data() {
        return {
          activeTab: 'bookmark',
          bookmarks: [],
          bookmarkValue: '',
          siteInfo: {
            favIconUrl: '',
            title: '',
            url: '',
          },
          config: {},
        }
      },

      created() {
        this.checkConfig()
        this.getSiteInfo()
      },

      mounted() {
        this.init()
      },

      computed: {
        displayBookmarks() {
          const val = this.bookmarkValue.toLowerCase()
          return this.bookmarks
            .filter(bookmark => bookmark.matchList.some(str => str.includes(val)))
            .filter((b, i) => i < 10)
        },

        isMoPage() {
          return this.config.moPageList.includes(this.siteInfo.host)
        },
      },

      methods: {

        checkConfig() {
          const storageConfig = localStorage.getItem(CONFIG_KEY)
          if (storageConfig) {
            this.config = JSON.parse(storageConfig)
          } else {
            this.config = DEFAULT_CONFIG
            this.updateConfig()
          }
        },

        updateConfig() {
          localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config))
        },

        init() {

          setTimeout(() => {
            chrome.bookmarks.getTree(treeNodes => {
              const flatNodes = this.flatBookmarkTreeNodes(treeNodes)
              this.bookmarks = flatNodes.map(({ title, url }) => {
                const lowerTitle = title.toLowerCase()
                const duoyinHandledStrList = getDuoyinHandledStrList(lowerTitle)
                const matchList = [
                  url.replace(/(http:\/\/|https:\/\/)/, ''),
                  lowerTitle,
                  getStringPinyin(lowerTitle, true),
                  ...duoyinHandledStrList.map(s => getStringPinyin(s, false)),
                ]
                return {
                  url,
                  title,
                  matchList,
                }
              })
            })
          }, 1)

          document.addEventListener('keyup', e => {
            const { key } = e
            const {
              activeTab: tab,
              displayBookmarks,
            } = this

            if (key === 'Enter' && tab === 'bookmark' && displayBookmarks[0]) {
              window.open(displayBookmarks[0].url)
            }
          })
        },

        flatBookmarkTreeNodes(treeNodes) {
          const flatNodes = []
          const flatChildren = children => {
            children.forEach(child => {
              if (child.children) {
                flatChildren(child.children)
              } else {
                flatNodes.push(child)
              }
            })
          }
          flatChildren(treeNodes)
          return flatNodes
        },

        getUrlHost(url) {
          return url.split('//')[1].split('/')[0]
        },

        getSiteInfo() {
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const { favIconUrl, title, url } = tabs[0]
            this.siteInfo = {
              favIconUrl,
              title,
              url,
              host: this.getUrlHost(url),
            }
          })
        },

        handleMoPage() {
          let list = [...this.config.moPageList]
          const host = this.siteInfo.host

          if (list.includes(host)) {
            list = list.filter(h => h !== host)
          } else {
            list.push(host)
          }

          this.config.moPageList = list
          this.updateConfig()

          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const { id, url } = tabs[0]
            chrome.tabs.update(id, { url })
          })

          window.close()
        },

      },

    })

  })

}(window));
