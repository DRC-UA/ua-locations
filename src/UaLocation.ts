import {oblast, OblastIso, OblastName} from './generated/oblast'
import {raion, RaionIso} from './generated/raion'
import {hromada, HromadaIso} from './generated/hromada'

export namespace UaLocation {

  export class Oblast {
    constructor(
      private shortIso: string,
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
      const shortIso = iso.replace('UA', '') as keyof typeof oblast
      const match: any = oblast[shortIso]
      return new Oblast(shortIso, match[0], match[1], match[2])
    }

    get iso() {
      return 'UA' + this.shortIso
    }

    get _5w() {
      return this.en + '_' + this.ua
    }

    get raions(): Raion[] {
      const matches = Object.entries(raion).filter(([iso]) => iso.startsWith(this.shortIso))
      return matches.map(([iso, data]: any) => {
        return new Raion(iso, data[0], data[1], data[2])
      })
    }
  }

  export class Raion {

    constructor(
      private shortIso: string,
      public en: string,
      public ua: string,
      public loc: [number, number],
    ) {
    }


    static readonly findByName = (name: string): Raion | undefined => {
      const match = Object.entries(raion).find(([iso, data]) => data[0].includes(name))
      if (match) {
        const [iso, data]: any = match
        return new Raion(iso, data[0], data[1], data[2])
      }
    }

    static readonly findByIso: {
      (iso: RaionIso): Raion
      (iso: string): Raion | undefined
    } = (iso) => {
      const match: any = raion[iso.replace('UA', '') as keyof typeof raion]
      return new Raion(iso, match[0], match[1], match[2])
    }

    get hromadas(): Hromada[] {
      const matches = Object.entries(hromada).filter(([iso, data]) => iso.startsWith(this.shortIso))
      return matches.map(([iso, data]: any) => {
        return new Hromada(iso, data[0], data[1], data[2])
      })
    }

    get iso() {
      return 'UA' + this.shortIso
    }

    get oblast(): Oblast {
      const parentIso = this.shortIso.slice(0, 2)
      return Oblast.findByIso(parentIso as any)
    }
  }

  export class Hromada {

    constructor(
      private shortIso: string,
      public en: string,
      public ua: string,
      public loc: [number, number],
    ) {
    }

    static readonly findByName = (name: string): Hromada | undefined => {
      const match = Object.entries(raion).find(([iso, data]) => data[0].includes(name))
      if (match) {
        const [iso, data]: any = match
        return new Hromada(iso, data[0], data[1], data[2])
      }
    }

    static readonly findByIso: {
      (iso: HromadaIso): Hromada
      (iso: string): Hromada | undefined
    } = (iso) => {
      const match: any = hromada[iso.replace('UA', '') as keyof typeof hromada]
      return new Hromada(iso, match[0], match[1], match[2])
    }

    readonly getSettlements = async (): Promise<Settlement[]> => {
      const res = await Settlement.findByHromadaIso(this.iso)
      return res!
    }

    get raion(): Raion {
      // UA6802019
      const parentIso = this.shortIso.slice(0, 4)
      return Raion.findByIso(parentIso as any)
    }

    get iso() {
      return 'UA' + this.shortIso
    }

    get _5w() {
      return `${this.en}_${this.iso}_${this.ua}`
    }
  }

  export class Settlement {

    constructor(
      private shortIso: string,
      public en: string,
      public ua: string,
      public loc: [number, number],
    ) {
    }

    private static settlements?: Record<string, any>
    private static settlements$?: Promise<Record<string, any>>
    private static parentToChild: Map<string, string[]> = new Map()

    static readonly getAll = async () => {
      if (this.settlements) return this.settlements
      if (!this.settlements$) {
        this.settlements$ = import('./generated/settlement').then((response) => {
          this.settlements = response.settlement
          Object.keys(response.settlement).forEach(iso => {
            const parentIso = iso.slice(0, 7)
            if (!this.parentToChild.has(parentIso)) this.parentToChild.set(parentIso, [])
            this.parentToChild.get(parentIso)!.push(iso)
          })
          return response.settlement
        })
      }

      return this.settlements$
    }

    static readonly findByHromadaIso: {
      (hromadaIso: HromadaIso): Promise<Settlement[]>
      (hromadaIso: string): Promise<Settlement[] | undefined>
    } = async (hromadaIso) => {
      await this.getAll()
      const isos = this.parentToChild.get(hromadaIso.replace('UA', ''))
      const res = isos ? await Promise.all(isos.map(this.findByIso)).then(_ => _.filter(_ => !!_)) : undefined
      return res as Settlement[]
    }

    static readonly findByIso = async (iso: string): Promise<Settlement | undefined> => {
      await this.getAll()
      const match: any = this.settlements![iso.replace('UA', '')]
      if (match) return new Settlement(iso, match[0], match[1], match[2])
    }

    static readonly findByName = async (name: string): Promise<Settlement | undefined> => {
      await this.getAll()
      const match = Object.entries(this.settlements!).find(([iso, data]) => data[0].includes(name))
      if (match) {
        const [iso, data] = match
        return new Settlement(iso, data[0], data[1], data[2])
      }
    }

    get iso() {
      return 'UA' + this.shortIso
    }

    get _5w() {
      return `${this.en}_${this.iso}_${this.ua}`
    }

    get hromada(): Hromada {
      // 1202001002
      const parentIso = this.shortIso.slice(0, 7)
      return Hromada.findByIso(parentIso as any)
    }
  }

}
