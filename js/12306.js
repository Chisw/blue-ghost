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

  const HTML = `
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

      <el-button :loading="loadingRoute" @click="addRoute()" type="primary">搜索</el-button>

      <div class="route-list">
        <div v-for="(route, index) in routeList" :key="index" class="route">
          <div>
            <span>{{stationMap[route.from]}}</span>
            <span>{{stationMap[route.to]}}</span>
            <span>{{route.date}}</span>
            <span @click="removeRoute(index)">移除</span>
          </div>
          <div>
            <el-checkbox-group v-model="route.filter.selectedTrainTypes">
              <el-checkbox
                v-for="type in route.filter.trainTypes"
                :label="type"
                :key="type"
              >
                {{type}}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <div>
            <el-checkbox-group v-model="route.filter.selectedFromStationCodes">
              <el-checkbox
                v-for="code in route.filter.fromStationCodes"
                :label="code"
                :key="code"
              >
                {{stationMap[code]}}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <div>
            <el-checkbox-group v-model="route.filter.selectedToStationCodes">
              <el-checkbox
                v-for="code in route.filter.toStationCodes"
                :label="code"
                :key="code"
              >
                {{stationMap[code]}}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <div>
            <el-time-select
              placeholder="起始时间"
              v-model="route.filter.rangeStart"
              :picker-options="{
                start: '00:00',
                step: '01:00',
                end: '24:00'
              }">
            </el-time-select>
            <el-time-select
              placeholder="起始时间"
              v-model="route.filter.rangeEnd"
              :picker-options="{
                start: '00:00',
                step: '01:00',
                end: '24:00'
              }">
            </el-time-select>
          </div>
          <div
            v-for="shift in route.shiftList.filter(shift => shiftFilter(shift, route.filter))"
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

  window.addEventListener('load', () => {

    const { DateTime } = luxon
    const { uniq } = _

    const container = document.createElement('div')
    container.setAttribute('id', 'blue-ghost-12306')
    container.innerHTML = HTML
    document.body.prepend(container)

    new Vue({
      el: '#blue-ghost-12306',

      data: {
        form: {
          from: 'GAU',
          to: 'SZH',
          date: '2021-04-15',
        },
        loadingRoute: false,
        routeList: [],
        stationList: [],
      },

      created() {
        this.initStations()
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
        async addRoute () {
          this.loadingRoute = true
          const train_date = typeof this.form.date === 'string'
            ? this.form.date
            : DateTime.fromJSDate(this.form.date).toFormat('yyyy-MM-dd')

          const shiftList = await fetch('https://kyfw.12306.cn/otn/leftTicket/query'
            + `?leftTicketDTO.train_date=${train_date}`
            + `&leftTicketDTO.from_station=${this.form.from}`
            + `&leftTicketDTO.to_station=${this.form.to}`
            + `&purpose_codes=ADULT`
          )
            .then(res => res.json())
            .then(data => data?.data?.result?.map(strToShift) || [])

          const { from, to, date } = this.form
          const trainTypes = uniq(shiftList.map(s => s.trainCode[0]))
          const fromStationCodes = uniq(shiftList.map(s => s.fromStationCode))
          const toStationCodes = uniq(shiftList.map(s => s.toStationCode))

          this.routeList.push({
            createdAt: Date.now(),
            from,
            to,
            date,
            shiftList,
            filter: {
              trainTypes,
              selectedTrainTypes: trainTypes,
              fromStationCodes,
              selectedFromStationCodes: fromStationCodes,
              toStationCodes,
              selectedToStationCodes: toStationCodes,
              rangeStart: '00:00',
              rangeEnd: '24:00',
            },
          })
          this.loadingRoute = false
        },

        removeRoute(index) {
          const _list = Array.from(this.routeList)
          _list.splice(index, 1)
          this.routeList = _list
        },

        async initStations() {
          const station_names_str = await fetch('https://kyfw.12306.cn/otn/resources/js/framework/station_name.js?station_version=1.9186')
            .then(res => res.text())
            .then(data => data)

          eval(station_names_str)  // station_names

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

function shiftFilter (shift, routerFilter) {
  const {
    trainCode,
    fromStationCode,
    toStationCode,
    startTime,
    arriveTime,
  } = shift

  const {
    selectedTrainTypes,
    selectedFromStationCodes,
    selectedToStationCodes,
    rangeStart,
    rangeEnd,
  } = routerFilter

  return selectedTrainTypes.includes(trainCode[0])
    && selectedFromStationCodes.includes(fromStationCode)
    && selectedToStationCodes.includes(toStationCode)
    && rangeStart <= startTime && startTime <= rangeEnd
}