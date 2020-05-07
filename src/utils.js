export { default as uniqBy } from 'lodash/uniqBy'
export { default as isEmpty } from 'lodash/isEmpty'
export { default as isEqual } from 'lodash/isEqual'
export { default as omit } from 'lodash/omit'
export { default as pick } from 'lodash/pick'
export { default as pickBy } from 'lodash/pickBy'
export { default as mapValues } from 'lodash/mapValues'
export { default as debounce } from 'lodash/debounce'
export { default as cloneDeepWith } from 'lodash/cloneDeepWith'
export { default as differenceBy } from 'lodash/differenceBy'
export { default as intersectionBy } from 'lodash/intersectionBy'

export function validate (data, constraints = {}) {
  for (const name in data) {
    if (constraints[name] && !constraints[name]?.(data[name], data)) {
      return false
    }
  }
  return true
}
