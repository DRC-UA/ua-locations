import * as XLSX from 'xlsx'
import fs from 'node:fs'
import {Obj, seq} from '@axanc/ts-utils'

import settlementGeoLoc from '../assets/settlement-geoloc.json'

import {capitalize} from './utils'

namespace Row {
  export type Oblast = {
    'Record ID': string
    Oblast: string
    'Admin1 Pcode': string
    'Oblast UKR': string
    LAT: string
    LON: string
  }
  export type Raion = {
    'Record ID': string
    'Oblast-Raion': string
    'Admin1 Pcode': string
    Oblast: string
    'Oblast UKR': string
    Raion: string
    'Admin2 Pcode': string
    'Raion UKR': string
    LAT: string
    LON: string
  }
  export type Hromada = {
    'Record ID': string
    'Oblast-Raion-Hromada': string
    'Admin1 Pcode': string
    'Admin2 Pcode': string
    'Admin3 Pcode': string
    Hromada: string
    'Hromada UKR': string
    LAT: string
    LON: string
  }
  export type Settlement = {
    'Record ID': string
    'Last edited time': string
    'Oblast-Raion-Hormada-Settlement': string
    'Admin1 Pcode': string
    'Admin2 Pcode': string
    'Admin3 Pcode': string
    'Admin4 Pcode': string
    'Settlement EN': string
    'Settlement UKR': string
  }
}

export class UaLocationBuilder {
  constructor(
    private args: {
      filePath: string
      outDir: string
    },
  ) {
    const workbook = XLSX.readFile(args.filePath)

    const sheets = {
      oblast: workbook.SheetNames[0],
      raion: workbook.SheetNames[1],
      hromada: workbook.SheetNames[2],
      settlement: workbook.SheetNames[3],
    }

    const data = {
      oblast: XLSX.utils.sheet_to_json<Row.Oblast>(workbook.Sheets[sheets.oblast]),
      raion: XLSX.utils.sheet_to_json<Row.Raion>(workbook.Sheets[sheets.raion]),
      hromada: XLSX.utils.sheet_to_json<Row.Hromada>(workbook.Sheets[sheets.hromada]),
      settlement: XLSX.utils.sheet_to_json<Row.Settlement>(workbook.Sheets[sheets.settlement]),
    }

    const transformed = {
      oblast: seq(data.oblast).reduceObject(_ => [
        _['Admin1 Pcode'], //.replace('UA', ''),
        [_['Oblast'], _['Oblast UKR'], [_['LAT'], _['LON']]],
      ]),
      raion: seq(data.raion).reduceObject(_ => [
        _['Admin2 Pcode'], //.replace('UA', ''),
        [_['Raion'], _['Raion UKR'], [_['LAT'], _['LON']]],
      ]),
      hromada: seq(data.hromada).reduceObject(_ => [
        _['Admin3 Pcode'], //.replace('UA', ''),
        [_['Hromada'], _['Hromada UKR'], [_['LAT'], _['LON']]],
      ]),
      settlement: seq(data.settlement).reduceObject(_ => {
        return [
          _['Admin4 Pcode'], //.replace('UA', ''),
          [_['Settlement EN'], _['Settlement UKR'], (settlementGeoLoc as unknown as any)[_['Admin4 Pcode']]],
        ]
      }),
    }

    const isosType = {
      oblast: data.oblast.map(_ => `'${_['Admin1 Pcode']}'`).join('|'),
      raion: data.raion.map(_ => `'${_['Admin2 Pcode']}'`).join('|'),
      hromada: data.hromada.map(_ => `'${_['Admin3 Pcode']}'`).join('|'),
    }

    Obj.keys(transformed).forEach(level => {
      const hasType = Object.hasOwn(isosType, level)
      const type = `${capitalize(level)}Iso`
      fs.writeFileSync(
        `${this.args.outDir}/${level}.ts`,
        [
          level === 'oblast'
            ? `export type OblastName = ${data.oblast.map(_ => `'${_['Oblast']}'`).join('|')}`
            : undefined,
          hasType ? `export type ${type} = ${(isosType as any)[level]}` : undefined,
          `export const ${level}${hasType ? `:Record<${type}, [string,string,[number,number]]>` : ':Record<string, any>'} = ${JSON.stringify(transformed[level]).replace(/"([^"]+)":/g, '$1:')}` +
            (hasType ? ' as const' : ''),
        ]
          .filter(_ => !!_)
          .join('\n'),
      )
    })
  }
}
