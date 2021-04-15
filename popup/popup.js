; (function () {

  window.addEventListener('load', () => {

    new Vue({
      el: '#blue-ghost-popup',
    
      data: {
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
      },

      created() {
        this.getSiteData()
        this.getConfigData()
      },

      mounted() {
        this.listenEvent()
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
      },

      methods: {

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

        listenEvent() {
          document.addEventListener('keyup', e => {
            if (e.key === 'Enter') {
              this.pickSite()
            }
          })
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

}());