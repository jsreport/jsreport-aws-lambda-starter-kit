const fs = require('fs')
const archiver = require('archiver')

if (fs.existsSync('lambda.zip')) {
    fs.unlinkSync('lambda.zip')
}

const output = fs.createWriteStream('lambda.zip')
const archive = archiver('zip')
archive.pipe(output)

archive.glob('./**/!(.local-chromium)')
archive.finalize()