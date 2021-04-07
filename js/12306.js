; (function () {

  window.addEventListener('load', () => {

    const container = document.createElement('div')
    container.setAttribute('id', 'blue-ghost-12306')
    container.innerHTML = `
      <div class="panel">
        <el-input v-model="form.from"></el-input>
        <el-button @click="getShifts()">123</el-button>
        <div>
          <div v-for="shift in list">
            <div>
              {{shift.start_time}} -> {{shift.arrive_time}}
            </div>
            <div>
              {{shift.from_station_telecode}} -> {{shift.to_station_telecode}}
            </div>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(container)

    new Vue({
      el: '#blue-ghost-12306',

      data: {
        form: {
          from: 'GAU',
          to: 'SZH',
          date: '2021-04-15',
        },

        list: [],

        Station: {},

      },

      created() {
        // this.initStation()
      },

      mounted() {

      },

      computed: {

      },

      methods: {
        async getShifts () {
          const data = await fetch('https://kyfw.12306.cn/otn/leftTicket/query'
            + `?leftTicketDTO.train_date=${this.form.date}`
            + `&leftTicketDTO.from_station=${this.form.from}`
            + `&leftTicketDTO.to_station=${this.form.to}`
            + `&purpose_codes=ADULT`
          )
            .then(res => res.json())
            .then(data => {
              const { result } = data.data
              const shiftList = result.map(str => {
                const keyStrList = decodeURIComponent(str).split('\n')
                const shiftStrList = keyStrList[keyStrList.length - 1].split('|')

                const [
                  ,
                  ,
                  train_no,
                  station_train_code,
                  start_station_telecode,
                  end_station_telecode,
                  from_station_telecode,
                  to_station_telecode,
                  start_time,
                  arrive_time,
                  lishi,
                  ,
                  ,
                  date,
                ] = shiftStrList

                const shift = {
                  // train_no,
                  station_train_code,
                  start_station_telecode,
                  end_station_telecode,
                  from_station_telecode,
                  to_station_telecode,
                  start_time,
                  arrive_time,
                  lishi,
                  date,
                }

                return shift
              })
              return shiftList
            })
            this.list = data
          return data
        },

        initStation() {
          this.Station = {
            list: window.station_names
              .split('@')
              .filter(Boolean)
              .map(station => {
                const [, name, code, pyFull, pyAbbr] = station.split('|')
                return {
                  name,
                  code,
                  pyAbbr,
                  pyFull,
                }
              }),
            search(key) {
              if (!key) return []
              return this.list.filter(s => [s.name, s.pyAbbr, s.pyFull].some(v => v.includes(key)))
            },
          }
        },
      },

    })

  })

}());