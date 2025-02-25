# ua-location ![npm](https://img.shields.io/npm/v/ua-location)

Easily navigate and query Ukrainian administrative divisions,
including **Oblasts**, **Raions**, **Hromadas**, and **Settlements**.

Features

- Search by **name** or **ISO code**.
- Provides **hierarchical traversal** (Oblast → Raion → Hromada → Settlement).
- Expose **English** and **Ukrainian** labels and **geolocation**.
- Works in both **frontend** and **backend** environments.
- Settlements are lazy loaded via `Promise`.
- Typing support of **ISO Code**.

### Installation

```
npm install ua-location
```

### Usage Example

```ts
import {UaLocation} from 'ua-location'

// Get Raion's information
const raion = UaLocation.Raion.findByIso('UA0102')
raion.en        // Bakhchysaraiskyi
raion.ua        // Бахчисарайський
raion.hromadas  // UaLocation.Hromada[]
raion._5w       // Bakhchysaraiskyi_Бахчисарайський
raion.loc       // [ 44.65944872, 33.83442735 ]
raion.oblast    // UaLocation.Oblast (Autonomous Republic of Crimea)

// Get all Hromadas of a given Oblast
const hromadas = UaLocation.Oblast.findByName('Chernihivska').raions.flatMap(_ => _.hromadas)

// Search for a Settlement
const settlement = await UaLocation.Oblast.findByName('Dnipropetrovska')
  .raions.find(_ => _.en.includes('Cherni'))
  ?.hromadas.find(_ => _.en.includes('Cherni'))
  ?.getSettlements().then(_ => _.find(_ => _.en.includes('Cherni'))?.en) // Chernihiv

// Get Oblast ISO of a Settlement reference
const oblast = settlement.hromada.raion.oblast.iso

// Get Hromada's name by ISO
const hromada = UaLocation.Hromada.findByIso('UA0102003').en // Aromatnenska
```