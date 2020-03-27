export { default as uniqBy } from 'lodash/uniqBy'

export function isEmpty (data) {
  return [Object, Array].includes((data || {}).constructor) && !Object.entries((data || {})).length
}

export function omit (data, keys) {
  return Object.keys(data)
    .filter(key => keys.indexOf(key) === -1)
    .reduce((newObj, key) => Object.assign(newObj, { [key]: data[key] }), {})
}

export function pickBy (data, func) {
  return Object.keys(data)
    .filter(key => func(data[key]))
    .reduce((newObj, key) => Object.assign(newObj, { [key]: data[key] }), {})
}

export function mapValues (data, func) {
  return Object.keys(data)
    .reduce((newObj, key) => Object.assign(newObj, { [key]: func(data[key], key) }), {})
}
