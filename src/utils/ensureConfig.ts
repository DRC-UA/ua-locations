import chalk from 'chalk'

// let's crash the app, if there are missing config elements
const ensureConfig = (object: Record<string, any>): void => {
  for (let property in object) {
    const value = object[property]
    if (value === undefined) {
      const message = `⚠️ ${chalk.whiteBright(`The tested config is missing ${chalk.bgRedBright.bold(` ${property} `)} property`)}`
      throw new Error(message)
    }

    if (typeof value !== 'string') ensureConfig(value)
  }
}

export {ensureConfig}
