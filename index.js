if (!process.env.CHROME_S3_BUCKET || !process.env.CHROME_S3_KEY) {
  throw new Error(`Download headless chrome from https://github.com/adieuadieu/serverless-chrome/releases and upload it unzipped to an s3 bucket,
                   set CHROME_S3_BUCKET and CHROME_S3_KEY as environment variable in AWS console`)
}

process.env.NODE_ENV='production'

const jsreport = require('jsreport')()
const fs = require('fs')
const promisify = require('util').promisify
const ncp = promisify(require('ncp'))
const AWS = require('aws-sdk');
const writeFile = promisify(fs.writeFile)
const chmod = promisify(fs.chmod)
const path = require('path')


const s3 = new AWS.S3()
const getBucket = promisify(s3.getObject).bind(s3)

const downloadS3Chrome = (async () => {  
  const res = await getBucket({
    Bucket: process.env.CHROME_S3_BUCKET,
    Key: process.env.CHROME_S3_KEY
  })  
  await writeFile('/tmp/headless-chromium', res.Body)
  return chmod('/tmp/headless-chromium', '755')  
})()

const init = ncp(path.join(__dirname, 'data'), '/tmp/data').then(() => jsreport.init())

exports.handler = async (event) => {  
  await init
  await downloadS3Chrome  

  const res = await jsreport.render(event.renderRequest)
  
  const response = {
      statusCode: 200,
      body: res.content.toString('base64'),
  }

  return response
}
