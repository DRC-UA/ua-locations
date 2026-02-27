import dotenv from 'dotenv'

import {ensureConfig} from '~/utils'

dotenv.config({debug: true})

const appConfig = (() => {
  return Object.freeze({
    activityinfo: {
      apiToken: process.env.ACTIVITYINFO_API_TOKEN!,
      baseUri: process.env.ACTIVITYINFO_BASE_URI!,
    } as const,
  } as const)
})()

ensureConfig(appConfig)

export {appConfig}
