; (function () {

  window.addEventListener('load', () => {

    const { DateTime } = luxon
    const { uniq, pick, isEqual } = _

    const container = document.createElement('div')
    container.setAttribute('id', 'blue-ghost-12306')
    container.innerHTML = window.DOM_JS_HTML
    document.body.prepend(container)

    new Vue({
      el: '#blue-ghost-12306',

      data: {
        form: {
          from: 'GAU',
          to: 'SZH',
          date: new Date(),
        },
        loadingRoute: false,
        loadingStations: false,
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

        isAllShiftsSelected() {
          return this.routeList.length && this.routeList.every(r => !!r.selectedShift)
        },
      },

      methods: {
        formatDate(date) {
          return DateTime.fromJSDate(date).toFormat('yyyy-MM-dd')
        },

        async addRoute () {
          this.loadingRoute = true
          const shiftList = await fetch('https://kyfw.12306.cn/otn/leftTicket/query'
            + `?leftTicketDTO.train_date=${this.formatDate(this.form.date)}`
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
            selectedShift: null,
          })
          this.loadingRoute = false
        },

        removeRoute(index) {
          const _list = Array.from(this.routeList)
          _list.splice(index, 1)
          this.routeList = _list
        },

        async initStations() {
          this.loadingStations = true
          const url = Array.from(document.scripts).find(s => s.src.includes('station_name'))?.src
          const station_names_str = await fetch(url)
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
          this.loadingStations = false
        },

        searchStation(key) {
          if (!key) return []
          return this.list.filter(s => [s.name, s.pyAbbr, s.pyFull].some(v => v.includes(key)))
        },

        getTimeDiffPrev(routeIndex, shift) {
          const prevRouteSelectedShift = this.routeList[routeIndex - 1]?.selectedShift
          if (routeIndex && prevRouteSelectedShift) {
            const currTime = DateTime.fromFormat(shift.startTime, 'HH:mm')
            const prevTime = DateTime.fromFormat(prevRouteSelectedShift.arriveTime, 'HH:mm')
            const {
              months,
              days,
              hours,
              minutes,
            } = currTime.diff(prevTime).shiftTo('months', 'days', 'hours', 'minutes', 'seconds').toObject()

            const res = [
              { unit: '个月', count: months },
              { unit: '天', count: days },
              { unit: '小时', count: hours },
              { unit: '分钟', count: minutes },
            ].map(({ unit, count }) => count ? `${count} ${unit}` : '').join(' ')

            return `间隔 ${res}`
          }
        },

        setSelectedRouteShift(routeIndex, shift) {
          this.routeList.forEach((route, index) => {
            if (index > routeIndex) {
              route.selectedShift = null
            } else if (index === routeIndex) {
              route.selectedShift = shift
            }
          })
        },

        isShiftDisabled(shift, routeIndex) {
          const isFirstRoute = routeIndex === 0
          const prevRouteSelectedShift = this.routeList[routeIndex - 1]?.selectedShift
          const isPrevRouteNoSelected = !prevRouteSelectedShift
          if (isFirstRoute || isPrevRouteNoSelected) {
            return false
          } else {
            return shift.startTime <= prevRouteSelectedShift.startTime
          }
        },

        isShiftSelected(shift, selectedShift) {
          const keys = ['trainCode', 'startTime', 'arriveTime']
          return isEqual(pick(shift, keys), pick(selectedShift, keys))
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