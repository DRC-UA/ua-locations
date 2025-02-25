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

  it('should get hromadas of a given oblast', () => {
    const hromadas = UaLocation.Oblast.findByIso('UA05').raions.flatMap(_ => _.hromadas)
    expect(hromadas.length > 10)
    expect(hromadas.every(_ => _.iso.startsWith('UA05')))
  })

  it('should find hromada by name', () => {
    const match = UaLocation.Hromada.findByName('Dnipro')
    UaLocation.Hromada.findByIso('UA0102003').en
    expect(match?.iso).toEqual('UA1202')
  })

  it('should find settlement by name', async () => {
    const match = await UaLocation.Settlement.findByName('Dnipro')
    expect(match?.iso).toEqual('UA1202001001')
  })
})