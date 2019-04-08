
# jsreport-aws-lambda-starter-kit

You can run jsreport serverless in aws lambda. This repository helps you to get started with basic flow.

## Get started

### Clone this repo
Start with cloning this repository...
```
git clone https://github.com/jsreport/jsreport-aws-lambda-starter-kit.git
```

### Prepare templates

Install dependencies and start jsreport...
```
npm i
npm start
```
Then open `http://localhost:5488` and prepare jsreport templates.

### Upload headless chrome
The headless chrome that works for you locally won't work in aws lambda. It needs to be recompiled for the specific distribution that runs there. Fortunatelly the recompiled chrome can be just downloaded.

Download and decompress it from    
[https://github.com/adieuadieu/serverless-chrome/releases](https://github.com/adieuadieu/serverless-chrome/releases)

Then upload it to an s3 bucket you have in aws lambda.

### Prepare package
The aws lambda expects compressed package with node application. The first you need to delete the `node_modules/puppeteer/.local-chromium` folder because that will get downloaded from aws s3 at the function startup. Then you can compress the application. Or just run already prepared script    
`node createLambdaPackage.js`.

### Create aws lambda
Now it is time to create aws lambda. For example using aws console. Just make sure to select node.js 8.10 or higher runtime. Then upload the package prepared in the previous step.

The next you need to increase the lambda timeout and also increase the memory settings. The rendering gets faster with more memory you assign. The recommendation is use 60s timeout and 1024MB.

And assign environment variables specifying the s3 bucket and key of the previously uploaded chrome.

And add to the precreated role the `AWSLambdaS3ExecutionRole` policy.

### Test the function
It is up to you how you want to integreate the lambda function. However I prepared  script which uses aws node.js sdk to invoke the lambda function and you can use it for testing.

1. Create aws IAM user with AWSLambdaRolerole
2. Set environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
3. Edit test.js and set your aws region and the lambda name
4. Run `node test.js`
5. Check the `report.pdf` was properly rendered

## Known issues

The re-compiled chrome binary doesn't render some specific fonts like Chinesse one. The issues is tracked [here](https://github.com/adieuadieu/serverless-chrome/issues/49) with some mentioned workarounds however this doesn't work us. We will update here as soon as we find out how this issue can be solved.