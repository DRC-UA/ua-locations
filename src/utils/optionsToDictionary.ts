import {SchemaElementKey} from '~/types'

const optionsToDictionary = (options: Record<SchemaElementKey, {type: string; storage: string; values: unknown[]}>) => {
  return Object.fromEntries(
    options.pcode.values.map((pcode, index) => [
      pcode as string,
      [options.en.values[index], options.uk.values[index], [options.lat.values[index], options.lon.values[index]]],
    ]),
  )
}

export {optionsToDictionary}
