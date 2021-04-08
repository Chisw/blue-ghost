; (function () {

  window.addEventListener('load', () => {

    const container = document.createElement('div')
    container.setAttribute('id', 'blue-ghost-12306')
    container.innerHTML = `
      <div>
        <el-select v-model="form.from" filterable placeholder="请选择">
          <el-option
            v-for="item in stationList"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>

        <el-select v-model="form.to" filterable placeholder="请选择">
          <el-option
            v-for="item in stationList"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>

        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="选择日期">
        </el-date-picker>

        <el-button :loading="loading" @click="getShifts()" type="primary">搜索</el-button>

        <div class="list-list">
          <div v-for="(list, index) in listList" :key="index" class="list">
            <div v-for="shift in list" :key="shift.code" class="shift">
              <div>
                <b>{{shift.station_train_code}}</b>
                {{shift.start_time}} ({{shift.lishi}}) {{shift.arrive_time}} 
              </div>
              <div>
                {{stationMap[shift.from_station_telecode]}} > {{stationMap[shift.to_station_telecode]}}
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.prepend(container)

    new Vue({
      el: '#blue-ghost-12306',

      data: {
        form: {
          from: 'GAU',
          to: 'SZH',
          date: '2021-04-15',
        },
        loading: false,
        listList: [],
        stationList: [],
      },

      created() {
        this.initStation()
      },

      mounted() {
        document.getElementById('gb_closeDefaultWarningWindowDialog_id')?.click()
      },

      computed: {
        stationMap() {
          const map = {}
          this.stationList.forEach(s => map[s.code] = s.name)
          return map
        },
      },

      methods: {
        async getShifts () {
          this.list = []
          this.loading = true
          const date = typeof this.form.date === 'string'
            ? this.form.date
            : luxon.DateTime.fromJSDate(this.form.date).toFormat('yyyy-MM-dd')

          const data = await fetch('https://kyfw.12306.cn/otn/leftTicket/query'
            + `?leftTicketDTO.train_date=${date}`
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
                  ,
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
            this.listList.push(data)
            this.loading = false
          return data
        },

        async initStation() {
          const stationsString = await fetch('https://kyfw.12306.cn/otn/resources/js/framework/station_name.js?station_version=1.9186')
            .then(res => res.text())
            .then(data => data)

          eval(stationsString)

          this.stationList = station_names
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
            })
        },

        searchStation(key) {
          if (!key) return []
          return this.list.filter(s => [s.name, s.pyAbbr, s.pyFull].some(v => v.includes(key)))
        },

      },

    })

  })

}());