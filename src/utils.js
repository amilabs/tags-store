export { default as cloneDeepWith } from 'lodash/cloneDeepWith'
export { default as compact } from 'lodash/compact'
export { default as debounce } from 'lodash/debounce'
export { default as difference } from 'lodash/difference'
export { default as differenceBy } from 'lodash/differenceBy'
export { default as differenceWith } from 'lodash/differenceWith'
export { default as get } from 'lodash/get'
export { default as intersectionBy } from 'lodash/intersectionBy'
export { default as isEmpty } from 'lodash/isEmpty'
export { default as isEqual } from 'lodash/isEqual'
export { default as mapValues } from 'lodash/mapValues'
export { default as omit } from 'lodash/omit'
export { default as pick } from 'lodash/pick'
export { default as pickBy } from 'lodash/pickBy'
export { default as uniqBy } from 'lodash/uniqBy'

export function validate (data, constraints = {}) {
  for (const name in data) {
    if (constraints[name] && !constraints[name]?.(data[name], data)) {
      return false
    }
  }
  return true
}
