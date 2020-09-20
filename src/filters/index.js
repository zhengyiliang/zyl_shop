import Vue from 'vue'

Vue.filter('dateFormat', function (val) {
  const dt = new Date(val)
  const year = dt.getFullYear()
  const moth = (dt.getMonth() + 1 + '').padStart(2, '0')
  const date = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${year}-${moth}-${date} ${hh}:${mm}:${ss}`
})
