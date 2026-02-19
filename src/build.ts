import path from 'node:path'

import {UaLocationBuilder} from './UaLocationBuilder'

new UaLocationBuilder({
  filePath: path.join(__dirname, '../assets', '/ukr_admin_boundaries_2026_02.xlsx'),
  outDir: path.join(__dirname, './generated'),
})
