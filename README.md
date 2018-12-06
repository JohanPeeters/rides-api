# Rides API

In this example, an access controlled API is set up with AWS Serverless Application Model (SAM).

AWS SAM is a set of AWS CloudFormation macros to declare serverless resources. Unfortunately the macros do not extend to security infrastructure, so most of the declared resources are vanilla CloudFormation.

Below is a brief explanation of what is in this repo:

```bash
.
├── README.md                   <-- This instructions file
├── ride_sharing                <-- Source code for a lambda function
│   ├── create.js               <-- Lambda function code to create a new ride
│   ├── list.js                 <-- Lambda function code to list rides
|   ├── read.js                 <-- Lambda function code to retrieve ride details
|   ├── update.js               <-- Lambda function code to update ride details
|   ├── delete.js               <-- Lambda function code to delete a ride
│   ├── package.json            <-- NodeJS dependencies
│   └── package-lock.json       <-- pinned dependencies
├── .gitignore
├── Makefile                    <-- contains targets to package and deploy
└── template.yaml               <-- SAM template
```

## Requirements

* SAM CLI installed (https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* AWS CLI configured with Administrator permission
* [NodeJS 8.10+ installed](https://nodejs.org/en/download/)
* [Docker installed](https://www.docker.com/community-edition)
* make

## Limitations

* *Authorizer:* `template.yaml` creates a Cognito User Pool called `riders`. It also creates an authorizer in the API that refers to the pool. Moreover, a test client is created that can request tokens. In order to start using it to protect the API, the following remains to be done:
  * configure a domain for the User Pool;
  * define resource servers that will consume access tokens with custom scopes.

## Setup process

## Packaging and deployment

Use the `deploy` `make` target:
```
$ make deploy
```
