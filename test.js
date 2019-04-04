const AWS = require('aws-sdk')
const fs = require('fs')

// make sure to set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env variables
const lambda = new AWS.Lambda({
  region: 'eu-west-1'
})

lambda.invoke({
  FunctionName: 'test',
  Payload: JSON.stringify({
    renderRequest: {
      template: {
        name: 'invoice-main'
      }
    }
  })
}, (err, res) => {
  if (err) {
    return console.error(err)
  }
  
  const response = JSON.parse(res.Payload)
  if (response.errorMessage) {
    console.log(response.errorMessage)
    console.log(response.stackTrace)
  } else {
    fs.writeFileSync('report.pdf', Buffer.from(response.body, 'base64'))
  }
})