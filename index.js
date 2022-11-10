const chromium = require('@sparticuz/chrome-aws-lambda')
const JsReport = require('jsreport')
const FS = require('fs-extra')
const path = require('path')
let jsreport

console.log('starting')


const init = (async () => {    
    jsreport = jsreport({
        configFile: path.join(__dirname, 'prod.config.json'),        
        chrome: {
            launchOptions: {
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
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
