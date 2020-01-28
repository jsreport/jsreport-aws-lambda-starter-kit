const fs = require('fs')
const archiver = require('archiver')
const { promisify } = require('util')
const rimraf = promisify(require('rimraf'))
const ncp = promisify(require('ncp'))

async function pckg() {
    if (fs.existsSync('layer.zip')) {
        fs.unlinkSync('layer.zip')
    }

    await ncp('node_modules/puppeteer/.local-chromium', '.local-chromium')
    await rimraf('node_modules/puppeteer/.local-chromium')

    const output = fs.createWriteStream('layer.zip')
    const archive = archiver('zip')
    archive.pipe(output)

    archive.directory('node_modules/', 'nodejs/node_modules');  
    await archive.finalize()
    await ncp('.local-chromium', 'node_modules/puppeteer/.local-chromium')
    await rimraf('.local-chromium')
    console.log('layer.zip is ready')
}

pckg().catch(console.error)