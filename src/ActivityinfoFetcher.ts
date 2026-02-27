import path from 'node:path'
import fs from 'node:fs'
import chalk from 'chalk'
import {type Ora} from 'ora'
import prettier from 'prettier'

import {columnsRequestMaker, capitalize, optionsToDictionary} from './utils'
import type {ActivityInfoSchema, ReferenceSchemaElement} from './types'

class ActivityinfoFetcher {
  readonly commonHeaders: RequestInit['headers']
  readonly baseUri: string
  readonly spinner: Ora

  constructor({token, baseUri, spinner}: {token: string; baseUri: string; spinner: Ora}) {
    this.commonHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Accept-Encoding': 'gzip, deflate, br',
      Accept: 'application/json',
      Connection: 'keep-alive',
    }
    this.baseUri = baseUri
    this.spinner = spinner
  }

  private async getSchema({
    formId = 'cxpfp3xm513b6r15nwo',
    label,
  }: {
    formId?: string
    label?: string
  }): Promise<ActivityInfoSchema> {
    try {
      this.spinner.start(`Loading ${label ? `${label} [${formId}]` : formId} schema from activityinfo.org`)
      const result = await fetch(new URL(`${this.baseUri}/resources/form/${formId}/schema`), {
        method: 'GET',
        headers: this.commonHeaders,
      })
      const schema: ActivityInfoSchema = await result.json()
      this.spinner.succeed(`The ${chalk.greenBright(`"${schema.label}"`)} schema is successfully downloaded`)
      return schema
    } catch (error) {
      this.spinner.fail()
      console.error(JSON.stringify(error, null, 2))
      throw new Error('Failed to fetch form schema')
    }
  }

  private async getOptions<T extends readonly {id: string; expression: string}[]>({
    formId,
    label,
    columns,
  }: {
    formId: string
    label: string
    columns: T
  }): Promise<Record<T[number]['id'], {type: string; storage: string; values: unknown[]}>> {
    try {
      this.spinner.start(`Loading ${chalk.greenBright(`"${label}"`)} options from activityinfo.org`)
      const result = await fetch(new URL(`${this.baseUri}/resources/query/columns`), {
        method: 'POST',
        headers: this.commonHeaders,
        body: JSON.stringify({
          rowSources: [
            {
              rootFormId: formId,
            },
          ],
          columns,
          truncateStrings: false,
        }),
      })
      if (!result.ok) throw result.statusText
      this.spinner.succeed(`The ${chalk.greenBright(`"${label}"`)} options are successfully downloaded`)
      return (await result.json()).columns
    } catch (error) {
      this.spinner.fail()
      console.error(JSON.stringify(error, null, 2))
      throw new Error('Failed to fetch form element options')
    }
  }

  async generateLocationsLibrary(formId?: string) {
    const formSchema = await this.getSchema({formId})

    const adminLevelFormIds: {formId: string; label: string}[] =
      formSchema?.elements
        .filter(({code, type, typeParameters}) => {
          return ['adm1', 'adm2', 'adm3', 'adm4'].includes(code) && type === 'reference' && 'range' in typeParameters
        })
        .map(({typeParameters, label}) => ({
          formId: (typeParameters as ReferenceSchemaElement['typeParameters']).range[0].formId, // safe to cast due to the filter above
          label,
        })) ?? []

    const [oblastSchema, raionSchema, hromadaSchema, settlementSchema] = await Promise.all(
      adminLevelFormIds.map(({formId, label}) => this.getSchema({formId, label})),
    )

    const oblastColumnsRequest = columnsRequestMaker(oblastSchema, {
      pcode: 'Admin1_Pcode',
      en: 'Oblast',
      uk: 'Oblast_UKR',
      lat: 'LAT',
      lon: 'LON',
    })

    const raionColumnsRequest = columnsRequestMaker(raionSchema, {
      pcode: 'Admin2_Pcode',
      en: 'Raion',
      uk: 'Raion_UKR',
      lat: 'LAT',
      lon: 'LON',
    })

    const hromadaColumnsRequest = columnsRequestMaker(hromadaSchema, {
      pcode: 'Admin3_Pcod',
      en: 'Hromada',
      uk: 'Hromada_UKR',
      lat: 'LAT',
      lon: 'LON',
    })

    const settlementColumnsRequest = columnsRequestMaker(settlementSchema, {
      pcode: 'Admin4_Pcode',
      en: 'Settlement_ENG',
      uk: 'Settlement_UKR',
      lat: 'LAT',
      lon: 'LON',
    })

    const oblastOptions = await this.getOptions({
      formId: oblastSchema!.id,
      label: oblastSchema!.label,
      columns: oblastColumnsRequest,
    })

    const raionOptions = await this.getOptions({
      formId: raionSchema!.id,
      label: raionSchema!.label,
      columns: raionColumnsRequest,
    })

    const hromadaOptions = await this.getOptions({
      formId: hromadaSchema!.id,
      label: hromadaSchema!.label,
      columns: hromadaColumnsRequest,
    })

    const settlementOptions = await this.getOptions({
      formId: settlementSchema!.id,
      label: settlementSchema!.label,
      columns: settlementColumnsRequest,
    })

    const adminLevelDictionary = {
      oblast: optionsToDictionary(oblastOptions),
      raion: optionsToDictionary(raionOptions),
      hromada: optionsToDictionary(hromadaOptions),
      settlement: optionsToDictionary(settlementOptions),
    }

    const prettierConfigPath = await prettier.resolveConfigFile()
    const prettierOptions = await prettier.resolveConfig(prettierConfigPath!)

    Object.entries(adminLevelDictionary).map(async ([adminLevel, dict]) => {
      try {
        this.spinner.start(`Exporting to ${chalk.greenBright(`"${adminLevel}.ts"...`)}`)
        const type = `${capitalize(adminLevel)}Iso`
        const content = [
          adminLevel === 'oblast' ? `export type OblastName = '${oblastOptions.en.values.join("'|'")}'` : undefined,
          `export type ${type} = '${Object.keys(dict).join("'|'")}'`,
          `export const ${adminLevel}: Record<${type}, [string,string,${adminLevel === 'settlement' ? 'any' : '[number,number]'}]> = ${JSON.stringify(dict, null, 2)} as const`,
        ]
          .filter(filePart => filePart !== undefined)
          .join('\n\n')
        const prettyContent = await prettier.format(content, {...prettierOptions, parser: 'typescript'})
        fs.writeFileSync(`${path.join(__dirname, 'generated')}/${adminLevel}.ts`, prettyContent)
        this.spinner.succeed(`Export to ${chalk.greenBright(`"${adminLevel}.ts"`)} is done`)
      } catch (error) {
        this.spinner.fail(
          `Export to ${chalk.greenBright(`"${adminLevel}.ts" failed with the following error:${chalk.bgRedBright(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))}`)}`,
        )
      }
    })
  }
}

export {ActivityinfoFetcher}
