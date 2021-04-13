/*
  route {
    createdAt,
    from,
    to,
    date,
    shiftList,
    filter {
      trainTypes,
      from,
      to,
      startTime,
      endTime,
    },
  }

  plan [{
    date,
    trainCode,
  }]

 */
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

        <div class="route-list">
          <div v-for="(route, index) in routeList" :key="index" class="route">
            <div>
              <span>{{stationMap[route.from]}}</span>
              <span>{{stationMap[route.to]}}</span>
              <span>{{route.date}}</span>
              <span @click="removeRoute(index)">移除</span>
            </div>
            <div>
              <el-checkbox-group v-model="route.filter.trainTypes">
                <el-checkbox
                  v-for="type in trainTypes"
                  :label="type"
                  :key="type"
                >
                  {{type}}
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <div
              v-for="shift in route.shiftList.filter(s => route.filter.trainTypes.includes(s.trainCode[0]))"
              :key="shift.code"
              class="shift"
            >
              <div>
                <b>{{shift.trainCode}}</b>
                {{shift.startTime}} ({{shift.duration}}) {{shift.arriveTime}} 
              </div>
              <div>
                {{stationMap[shift.fromStationCode]}} > {{stationMap[shift.toStationCode]}}
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
        trainTypes: ['G', 'C', 'D', 'T', 'K', 'Z'],
        form: {
          from: 'GAU',
          to: 'SZH',
          date: '2021-04-15',
        },
        loading: false,
        routeList: [],
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
              const shiftList = data?.data?.result?.map(strToShift) || []
              return shiftList
            })
            this.routeList.push({
              createdAt: Date.now(),
              from: this.form.from,
              to: this.form.to,
              date: this.form.date,
              shiftList: data,
              filter: {
                trainTypes: Array.from(this.trainTypes),
                from: [],
                to: [],
                startTime: '00:00',
                endTime: '23:59',
              },
            })
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

        removeRoute(index) {
          const _list = Array.from(this.routeList)
          _list.splice(index, 1)
          this.routeList = _list
        },

      },

    })

  })

}());


function strToShift (str) {
  const keyStrList = decodeURIComponent(str).split('\n')
  const shiftStrList = keyStrList[keyStrList.length - 1].split('|')

  const [
    ,
    ,
    ,
    trainCode,
    startStationCode,
    endStationCode,
    fromStationCode,
    toStationCode,
    startTime,
    arriveTime,
    duration,
    ,
    ,
    date,
  ] = shiftStrList

  const shift = {
    trainCode,
    startStationCode,
    endStationCode,
    fromStationCode,
    toStationCode,
    startTime,
    arriveTime,
    duration,
    date,
  }
  return shift
}
