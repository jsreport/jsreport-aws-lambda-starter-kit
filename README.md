
# jsreport-aws-lambda-starter-kit

You can run jsreport serverless in aws lambda. This repository helps you to get started with basic flow.

## Create aws lambda function
You can use cli or do it right from the aws console.

## Clone this repo
```
git clone https://github.com/jsreport/jsreport-aws-lambda-starter-kit.git
```

## Prepare templates

Install deps and start jsreport...
```
npm i
npm start
```
Now you can open `http://localhost:5488` and prepare jsreport templates.

## Upload headless chrome
The headless chrome that works for you locally won't work in aws lambda. It needs to be recompiled for the specific distribution that runs there. Fortunatelly the recompiled chrome can be just downloaded.

Download and decompress it...
```
https://github.com/adieuadieu/serverless-chrome/releases
```

Then upload it to an s3 bucket you have in aws lambda.

## Prepare aws lambda
