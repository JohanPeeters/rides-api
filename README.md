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

The generated API can be tested with the [assess-rest-api test client](https://github.com/JohanPeeters/assess-rest-api).

## Requirements

* [SAM CLI installed](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* AWS CLI configured with Administrator permission
* [NodeJS 8.10+ installed](https://nodejs.org/en/download/)
* [Docker installed](https://www.docker.com/community-edition)
* make

## Limitations

* *Authorizer:* `template.yaml` creates a Cognito User Pool called `riders`. It also creates an authorizer in the API that refers to the pool. Moreover, a test client is created that can request tokens. In order to start using the Cogito User Pool, the following remains to be done:
  * define a resource server that will consume access tokens with custom scopes:
    * the resource server represents the access controlled API. The resource server is assumed by the authorizer to be identified as `rides`, so make sure that this is the identifier you configure for the new resource server. This identifier string is what some other authorization server vendors refer to as the audience, often represented in JWT tokens in the `aud` claim;
    * scopes express permissions to perform actions on the API. The template configures various methods to  require the following scopes: `create`, `update` and `delete`. These scopes have to be added to the resource server. Note that the scope configuration on the API side concatenates the resource server identifier (`rides`) and the scope proper, e.g. `rides/update`, to form the scope string to be tested by the authorizer;
  * configure the test client to be allowed to request access tokens via the OAuth Client Credentials Grant. Make sure that the test client can request all access token scopes available - this should be `rides/create`, `rides/update` and `rides/delete`;
  * configure a domain for your user pool.

## Setup process

### Packaging and deployment

Use the `deploy` `make` target:
```
$ make deploy
```

### Manual tweaks

See the [Limitations](#limitations) section.

### Test

Create a `data.json` file to specify access control expectations and run the [assess-rest-api test client](https://github.com/JohanPeeters/assess-rest-api).
