Caveat: work in progress

# Rides API

In this example, an API is set up with AWS Serverless Application Model (SAM).
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
├── openapi.yaml                <-- OpenAPI definition of the exposed API
└── template.yaml               <-- SAM template
```

## Requirements

* SAM CLI installed (https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* AWS CLI configured with Administrator permission
* [NodeJS 8.10+ installed](https://nodejs.org/en/download/)
* [Docker installed](https://www.docker.com/community-edition)
* make

## Limitations

* *API keys:* while a `ride-sharing` API key is created with `template.yaml`, there is no apparent way to declaratively associate this with resources and methods. While it is possible to define a CloudFormation Usage Plan resource, this is not included in this project's template. So, in order to protect the API with an API key, do the following:
  * create a Usage Plan with
     * associated ride sharing API and stage (prod);
     * add the `ride-sharing` API key to the Usage Plan;
  * configure each method that you want to protect with an API key to require one;
* *Authorizer:* `template.yaml` creates a Cognito User Pool called `riders`. It also creates an authorizer in the API that refers to the pool. Moreover, a test client is created that can request tokens. In order to start using it to protect the API, the following remains to be done:
  * configure a domain for the User Pool;
  * define clients that can request tokens;
  * define resource servers that will consume access tokens;
  * an Authorizer based on `riders` remains to be created. Protected methods also need to be configured to require a token with an appropriate scope issued by the User Pool.

## Setup process

## Packaging and deployment

Use the `deploy` `make` target:
```
$ make deploy
```
