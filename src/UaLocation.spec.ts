import {UaLocation} from './UaLocation'
import exp from 'node:constants'

describe('UaLocation', () => {
  it('should traverse to hromada', () => {
    const root = UaLocation.Oblast.findByName('Chernihivska')
    const leaf = root
      .raions.find(_ => _.en.includes('Chernihivsky'))
      ?.hromadas.find(_ => _.en.includes('Cherni'))!
    expect(leaf.parent.parent.iso).toEqual(root.iso)
  })

  it('should traverse to settlement', async () => {
    const root = UaLocation.Oblast.findByName('Dnipropetrovska')
    const leaf = await root
      .raions[0]
      .hromadas[0]
      .getSettlements().then(_ => _[0])
    expect(leaf.parent.parent.parent.iso).toEqual(root.iso)
  })

  it('should find raion by name', () => {
    const match = UaLocation.Raion.findByName('Dnipro')
    expect(match?.iso).toEqual('UA1202')
  })

  it('should find hromada by name', () => {
    const match = UaLocation.Hromada.findByName('Dnipro')
    expect(match?.iso).toEqual('UA1202')
  })

  it('should find settlement by name', async () => {
    const match = await UaLocation.Settlement.findByName('Dnipro')
    expect(match?.iso).toEqual('UA1202001001')
  })
})