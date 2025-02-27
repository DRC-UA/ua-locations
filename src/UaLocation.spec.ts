import {UaLocation} from './UaLocation'

describe('UaLocation', () => {
  it('should traverse to hromada', () => {
    const root = UaLocation.Oblast.findByName('Chernihivska')
    const leaf = root
      .raions.find(_ => _.en.includes('Chernihivsky'))
      ?.hromadas.find(_ => _.en.includes('Cherni'))!
    expect(leaf.raion.oblast.iso).toEqual(root.iso)
  })

  it('should traverse to settlement', async () => {
    const root = UaLocation.Oblast.findByName('Dnipropetrovska')
    const leaf = await root
      .raions[0]
      .hromadas[0]
      .getSettlements().then(_ => _[0])
    expect(leaf.hromada.raion.oblast.iso).toEqual(root.iso)
  })

  it('should get raion data', () => {
    const raion = UaLocation.Raion.findByIso('UA0102')
    expect(raion.en).toEqual('Bakhchysaraiskyi')
    expect(raion.ua).toEqual('Бахчисарайський')
    expect(raion.hromadas).not.toBeNull()
    expect(raion._5w).toEqual('Bakhchysaraiskyi_Бахчисарайський')
    expect(raion.loc).toEqual([ 44.65944872, 33.83442735 ])
    expect(raion.oblast).not.toBeNull()

  })
  it('should get hromadas of a given oblast', () => {
    const hromadas = UaLocation.Oblast.findByIso('UA05').raions.flatMap(_ => _.hromadas)
    expect(hromadas.length > 10)
    expect(hromadas.every(_ => _.iso.startsWith('UA05')))
  })

  it('should find hromada by name', () => {
    const match = UaLocation.Hromada.findByName('Dniprovska')
    expect(match?.iso).toEqual('UA1202001')
  })

  it('should find settlement by name', async () => {
    const match = await UaLocation.Settlement.findByName('Dnipro')
    expect(match?.iso).toEqual('UA1202001001')
  })
})