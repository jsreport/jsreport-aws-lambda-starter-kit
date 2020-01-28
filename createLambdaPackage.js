const fs = require('fs')
const archiver = require('archiver')
const { promisify } = require('util')
const rimraf = promisify(require('rimraf'))
const ncp = promisify(require('ncp'))

async function pckg() {
    if (fs.existsSync('lambda.zip')) {
        fs.unlinkSync('lambda.zip')
    }

    const output = fs.createWriteStream('lambda.zip')
    const archive = archiver('zip')
    archive.pipe(output)

    archive.directory('data', 'data');  
    archive.file('prod.config.json');  
    archive.file('index.js');  
    await archive.finalize()    
    console.log('lambda.zip is ready')
}

pckg().catch(console.error)