const chromium = require('chrome-aws-lambda')
const JsReport = require('jsreport')
const promisify = require('util').promisify
const ncp = promisify(require('ncp'))
const path = require('path')
const fs = require('fs')
let jsreport


const init = (async () => {    
    jsreport = JsReport({
        configFile: path.join(__dirname, 'prod.config.json'),        
        chrome: {
            launchOptions: {
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: chromium.headless,
            }         
        }
    })
    await ncp(path.join(__dirname, 'data'), '/tmp/data')
    return jsreport.init()
})()

exports.handler = async (event) => {  
  await init

  const res = await jsreport.render(event.renderRequest)
  
  const response = {
      statusCode: 200,
      body: res.content.toString('base64'),
  }

  return response
}
