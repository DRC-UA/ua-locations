import {oblast, OblastIso, OblastName} from './generated/oblast'
import {raion, RaionIso} from './generated/raion'
import {hromada, HromadaIso} from './generated/hromada'
import {Obj} from '@axanc/ts-utils'

export namespace UaLocation {

  export class Oblast {
    constructor(
      public iso: string,
      public en: string,
      public ua: string,
      public loc: [number, number],
    ) {
    }

    static readonly findByName = (name: OblastName): Oblast => {
      const [iso, match]: any = Object.entries(oblast).find(([iso, data]) => data[0] === name)!
      return new Oblast(iso, match[0], match[1], match[2])

    }

    static readonly findByIso = (iso: OblastIso): Oblast => {
      const match: any = oblast[iso as keyof typeof oblast]
      return new Oblast(iso, match[0], match[1], match[2])
    }

    get _5w() {
      return `${this.en}_${this.ua}`
    }

    get raions(): Raion[] {
      const matches = Object.entries(raion).filter(([iso]) => iso.startsWith(this.iso))
      return matches.map(([iso, data]: any) => {
        return new Raion(iso, data[0], data[1], data[2])
      })
    }
  }

  export class Raion {

    constructor(
      public iso: string,
      public en: string,
      public ua: string,
      public loc: [number, number],
    ) {
    }


    static readonly findByName = (name: string): Raion | undefined => {
      const match = Object.entries(raion).find(([iso, data]) => data[0] === name)
      if (match) {
        const [iso, data]: any = match
        return new Raion(iso, data[0], data[1], data[2])
      }
    }

    static readonly findByIso: {
      (iso: RaionIso): Raion
      (iso: string): Raion | undefined
    } = (iso) => {
      const match: any = raion[iso as keyof typeof raion]
      return new Raion(iso, match[0], match[1], match[2])
    }

    get hromadas(): Hromada[] {
      const matches = Object.entries(hromada).filter(([iso, data]) => iso.startsWith(this.iso))
      return matches.map(([shortIso, data]: any) => {
        return new Hromada(shortIso, data[0], data[1], data[2])
      })
    }

    get _5w() {
      return `${this.en}_${this.ua}`
    }

    get oblast(): Oblast {
      const parentIso = this.iso.slice(0, 4)
      return Oblast.findByIso(parentIso as any)
    }
  }

  export class Hromada {

    constructor(
      public iso: string,
      public en: string,
      public ua: string,
      public loc: [number, number],
    ) {
    }

    static readonly findByName = (name: string): Hromada | undefined => {
      const match = Object.entries(hromada).find(([iso, data]) => data[0] === name)
      if (match) {
        const [iso, data]: any = match
        return new Hromada(iso, data[0], data[1], data[2])
      }
    }

    static readonly findByIso: {
      (iso: HromadaIso): Hromada
      (iso: string): Hromada | undefined
    } = (iso) => {
      const match: any = hromada[iso as keyof typeof hromada]
      return new Hromada(iso, match[0], match[1], match[2])
    }

    readonly getSettlements = async (): Promise<Settlement[]> => {
      const res = await Settlement.findByHromadaIso(this.iso)
      return res!
    }

    get raion(): Raion {
      // UA6802019
      const parentIso = this.iso.slice(0, 6)
      return Raion.findByIso(parentIso as any)
    }

    get _5w() {
      return `${this.en}_${this.iso}_${this.ua}`
    }
  }

  type SettlementData = {
    en: string,
    ua: string,
    loc: [number, number],
  }

  export class Settlement {

    constructor(
      public iso: string,
      public en: string,
      public ua: string,
      public loc: [number, number],
    ) {
    }

    private static settlements?: Map<string, Settlement>
    private static settlements$?: Promise<Map<string, Settlement>>
    private static parentToChild: Map<string, string[]> = new Map()

    static readonly getAll = async () => {
      if (this.settlements) return this.settlements
      if (!this.settlements$) {
        this.settlements$ = import('./generated/settlement').then((response) => {
          this.settlements = new Map<string, Settlement>()
          Object.entries(response.settlement).forEach(([iso, data]) => {
            this.settlements!.set(iso, new Settlement(iso, data[0], data[1], data[2]))
            const parentIso = iso.slice(0, 9)
            if (!this.parentToChild.has(parentIso)) this.parentToChild.set(parentIso, [])
            this.parentToChild.get(parentIso)!.push(iso)
          })
          return this.settlements
        })
      }

      return this.settlements$
    }

    static readonly findByHromadaIso: {
      (hromadaIso: HromadaIso): Promise<Settlement[]>
      (hromadaIso: string): Promise<Settlement[] | undefined>
    } = async (hromadaIso) => {
      await this.getAll()
      const isos = this.parentToChild.get(hromadaIso)
      const res = isos ? await Promise.all(isos.map(this.findByIso)).then(_ => _.filter(_ => !!_)) : undefined
      return res as Settlement[]
    }

    static readonly findByIso = async (iso: string): Promise<Settlement | undefined> => {
      await this.getAll()
      return this.settlements?.get(iso)
    }

    static readonly findByName = async (name: string): Promise<Settlement | undefined> => {
      await this.getAll()
      return Array.from(this.settlements?.values() ?? []).find(_ => _.en === name)
    }

    get _5w() {
      return `${this.en}_${this.iso}_${this.ua}`
    }

    get hromada(): Hromada {
      // UA1202001002
      const parentIso = this.iso.slice(0, 9)
      return Hromada.findByIso(parentIso as any)
    }
  }

}
