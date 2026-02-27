import {ActivityInfoSchema, SchemaElementKey} from '~/types'

const insideObjectOut = <K extends string, V extends string>(input: Record<K, V>) => {
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [value, key]))
}

const columnsRequestMaker = <const K extends readonly string[]>(
  schema: ActivityInfoSchema,
  dict: Record<SchemaElementKey, ActivityInfoSchema['elements'][number]['code']>,
): {
  id: SchemaElementKey
  expression: string
}[] => {
  return schema.elements
    .filter(({code}) => Object.values(dict).includes(code))
    .map(({id, code}) => ({id: insideObjectOut(dict)[code], expression: id}))
}

export {columnsRequestMaker}
