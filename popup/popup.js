; (function (window) {

  window.addEventListener('load', () => {

    const {
      chrome,
      document,
      localStorage,
      getStringPinyin,
      getDuoyinHandledStrList,
      luxon,
    } = window

    new Vue({
      el: '#blue-ghost-popup',
    
      data() {
        return {
          activeTab: 'bookmark',
          bookmarks: [],
          bookmarkValue: '',
          site: {
            favIconUrl: '',
            title: '',
            url: '',
          },
          configKey: 'BLUE_GHOST_CONFIG',
          config: {
            api: '',
            token: '',
            newTab: '',
          },
        }
      },

      created() {
        this.getSiteData()
        this.getConfigData()
      },

      mounted() {
        this.init()
      },

      computed: {
        pickSiteDisabled() {
          return this.site.title.length === 0
            || this.site.title.length > 512
            || !this.config.api
            || !this.config.token
        },

        updateConfigDisabled() {
          return JSON.stringify(this.config) === localStorage.getItem(this.configKey)
        },

        displayBookmarks() {
          const val = this.bookmarkValue.toLowerCase()
          return this.bookmarks
            .filter(bookmark => bookmark.matchList.some(str => str.includes(val)))
            .filter((b, i) => i < 10)
        },
      },

      methods: {

        reloadBlueGhost() {
          chrome.runtime.reload()
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

        getSiteData() {
          chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const { favIconUrl, title, url } = tabs[0]
            this.site = { favIconUrl, title, url }
          })
        },

        getConfigData() {
          const json = localStorage.getItem(this.configKey)
          if (json) {
            this.config = JSON.parse(json)
          }
        },

        updateConfig() {
          localStorage.setItem(this.configKey, JSON.stringify(this.config))
        },

        async pickSite () {
          const { favIconUrl, title, url } = this.site

          const form = {
            code: this.config.token,
            id: Math.random().toString(36).substring(3, 9),
            date: luxon.DateTime.fromJSDate(new Date()).toFormat('yyyy-MM-dd HH:mm:ss'),
            avatar: favIconUrl,
            title,
            url,
            lv: '0',
            type: '3',
            tag: 'BlueGhost,49',
          }

          const body = new URLSearchParams()
          for (const k in form) body.append(k, form[k])

          const res = await fetch(this.config.api, {
            method: 'POST',
            headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }),
            body,
          })

          const data = await res.json()

          if (data.result) {
            this.$message.success(`OK: ${this.site.title}`)
            setTimeout(window.close, 1200)
          } else {
            this.$message.error(JSON.stringify(data) + JSON.stringify(form))
          }
        },

      },

    })

  })

}(window));