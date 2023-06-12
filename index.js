const JsReport = require('jsreport')
const FS = require('fs-extra')
const path = require('path')
const os = require('os')

const chromium = require("@sparticuz/chromium")
chromium.setHeadlessMode = true

// Optional: Load any fonts you need. Open Sans is included by default in AWS Lambda instances
/*await chromium.font(
  "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
)*/

let jsreport

console.log('starting')

const init = (async () => {    
    // this speeds up cold start by some ~500ms    
    precreateExtensionsLocationsCache()

    jsreport = JsReport({
        configFile: path.join(__dirname, 'prod.config.json'),        
        chrome: {
            launchOptions: {
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            }         
        }
    })
    await FS.copy(path.join(__dirname, 'data'), '/tmp/data')
    return jsreport.init()
})()

exports.handler = async (event) => {  
  console.log('handling event')
  await init

  const res = await jsreport.render(event.renderRequest)
  
  const response = {
      statusCode: 200,
      body: res.content.toString('base64'),
  }

  return response
}

async function precreateExtensionsLocationsCache() {    
    const rootDir = path.join(path.dirname(require.resolve('jsreport')), '../../')    
    const locationsPath = path.join(rootDir, 'node_modules/locations.json')
    
    if (FS.existsSync(locationsPath)) {
        console.log('locations.json found, extensions crawling will be skipped')
        const locations = JSON.parse(FS.readFileSync(locationsPath)).locations
        const tmpLocationsPath = path.join(os.tmpdir(), 'jsreport', 'core', 'locations.json')
        FS.ensureFileSync(tmpLocationsPath)
        FS.writeFileSync(tmpLocationsPath, JSON.stringify({
            [path.join(rootDir, 'node_modules') + '/']: {
                rootDirectory: rootDir,
                locations: locations.map(l => path.join(rootDir, l).replace(/\\/g, '/')),
                lastSync: Date.now()
            }
        }))        
        
    } else {
        console.log('locations.json not found, the startup will be a bit slower')
    }
}