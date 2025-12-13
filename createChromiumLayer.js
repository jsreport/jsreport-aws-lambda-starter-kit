const fs = require('fs')
const archiver = require('archiver')
const FS = require('fs-extra')
const path = require('path')
const { rimraf } = require('rimraf')

const fileUtils = require('@jsreport/jsreport-core/lib/main/extensions/fileUtils')

async function pckg() {
    console.log('creating chromiumLayer.zip...')
    if (fs.existsSync('chromiumLayer.zip')) {
        fs.unlinkSync('chromiumLayer.zip')
    }    

     await FS.move('node_modules/@sparticuz', '@sparticuz')
    
    const output = fs.createWriteStream('chromiumLayer.zip')
    const archive = archiver('zip')
    archive.pipe(output)  

    archive.directory('@sparticuz', 'nodejs/node_modules/@sparticuz');  
    
    await archive.finalize()

    await FS.move('@sparticuz', 'node_modules/@sparticuz')
    
    console.log('chromiumLayer.zip is ready')
}

pckg().catch(console.error)