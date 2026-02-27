import chalk from 'chalk'
import ora from 'ora'

import {appConfig} from '~/config'

import {ActivityinfoFetcher} from './ActivityinfoFetcher'

const aiFetcher = new ActivityinfoFetcher({
  token: appConfig.activityinfo.apiToken,
  baseUri: appConfig.activityinfo.baseUri,
  spinner: ora(),
})

aiFetcher
  .generateLocationsLibrary(process.argv[2])
  .catch(error =>
    console.error(
      `The locations fetch failed due to the:\n${chalk.bgRedBright(` ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)} `)}`,
    ),
  )
