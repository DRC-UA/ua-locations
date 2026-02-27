interface SchemaElement {
  id: string
  code: string
  label: string
  description: string | null
  relevanceCondition: string | null
  validationCondition: string | null
  required: boolean
}

interface FreeTextSchemaElement extends SchemaElement {
  type: 'FREE_TEXT'
  typeParameters: {
    barcode: boolean
  }
}

interface ReferenceSchemaElement extends SchemaElement {
  type: 'reference'
  typeParameters: {
    range: [
      {
        formId: string
      },
    ]
  }
}

type ActivityInfoSchema = {
  id: string
  schemaVersion: number
  databaseId: string
  label: string
  elements: (FreeTextSchemaElement | ReferenceSchemaElement)[]
}

type SchemaElementKey = 'pcode' | 'en' | 'uk' | 'lat' | 'lon'

export type {ActivityInfoSchema, ReferenceSchemaElement, SchemaElementKey}
