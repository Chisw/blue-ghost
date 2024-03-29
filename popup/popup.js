; (function (window) {

  const {
    chrome,
    document,
    localStorage,
    getStringPinyin,
    getDuoyinHandledStrListGroup,
  } = window

  const CONFIG_KEY = 'BLUE_GHOST_CONFIG'
  const DEFAULT_CONFIG = {
    version: '0.1.0',
    hiddenBookmarkList: [],
    newTabUrl: '',
    moPageList: [],
    password: '',
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
          passwordForm: {
            visit: '',
            input: '',
            input2: '',
          },
        }
      },

      created() {
        this.checkConfig()
        this.getSiteInfo()
      },

      mounted() {
        this.init()
      },

      watch: {
        activeTab() {
          if (this.activeTab === 'config' && this.showPasswordMask) {
            this.$nextTick(() => this.$refs.visitPassword.focus())
          }
        },
      },

      computed: {
        displayBookmarkList() {
          const list = this.config.hiddenBookmarkList
          const val = this.bookmarkValue.toLowerCase()
          return this.bookmarks
            .filter(({ url, matchList }) => {
              return list.every(item => item.url !== url)
                && matchList.some(str => str.includes(val))
            })
            .filter((b, i) => i < 10)
        },

        isMoPage() {
          return this.config.moPageList.includes(this.siteInfo.host)
        },

        showPasswordMask() {
          const pwd = this.config.password
          return pwd && this.passwordForm.visit !== pwd
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
                const [duoyinHandledStrList, duoyinHandledStrListF] = getDuoyinHandledStrListGroup(lowerTitle)
                const matchList = [
                  url.replace(/(http:\/\/|https:\/\/)/, ''),
                  lowerTitle,
                  getStringPinyin(lowerTitle, true),
                  ...duoyinHandledStrList.map(s => getStringPinyin(s, false)),
                  ...duoyinHandledStrListF.map(s => getStringPinyin(s, true)),
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
              displayBookmarkList,
            } = this

            if (key === 'Enter' && tab === 'bookmark' && displayBookmarkList[0]) {
              window.open(displayBookmarkList[0].url)
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

        handleHideBookmark(bookmark) {
          const list = [...(this.config.hiddenBookmarkList || []), bookmark]
          this.config.hiddenBookmarkList = list
          this.updateConfig()
          return false
        },

        handleShowBookmark(bookmark) {
          const list = [...(this.config.hiddenBookmarkList || [])].filter(bk => bk.url !== bookmark.url)
          this.config.hiddenBookmarkList = list
          this.updateConfig()
        },

        getUrlHost(url) {
          return url.split('//')[1].split('/')[0]
        },

        nothing() {
          return false
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

        handleClearHistory() {
          chrome.history.deleteAll(res => {
            this.$message.success('清除成功')
          })
        },

        handlePassword() {
          const { input, input2 } = this.passwordForm

          let error = ''

          if (!input || !input2) {
            error = '请输入密码'
          } else if (input !== input2) {
            error = '两次密码输入不一致'
          }

          if (error) {
            this.$message.error(error)
            return
          }

          this.passwordForm = {
            visit: '',
            input: '',
            input2: '',
          }
          this.config.password = input
          this.updateConfig()

          this.$message.success('操作成功')

        },

      },

    })

  })

}(window));
