# Rides API

In this example, an access controlled API is set up with AWS Serverless Application Model (SAM).

AWS SAM is a set of AWS CloudFormation macros to declare serverless resources. Unfortunately the macros do not extend to security infrastructure, so most of the declared resources are vanilla CloudFormation.

Here is an overview of the content of this repo:

```
.
├── README.md                   <-- This file
├── ride_sharing                <-- Source code for a lambda function
│   ├── test                    <-- contains unit tests for the lambda functions
│   │   └── list.js
│   ├── create.js               <-- Lambda function code to create a new ride
│   ├── list.js                 <-- Lambda function code to list rides
|   ├── read.js                 <-- Lambda function code to retrieve ride details
|   ├── update.js               <-- Lambda function code to update ride details
|   ├── delete.js               <-- Lambda function code to delete a ride
│   ├── options.js              <-- Lambda function to answer pre-flight requests
│   ├── package.json            <-- NodeJS dependencies
│   └── package-lock.json       <-- pinned dependencies
├── .gitignore
├── Makefile                    <-- contains targets to package and deploy
└── template.yaml               <-- SAM template
```

## Pre-requisites

* [SAM CLI installed](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* AWS CLI configured with Administrator permission
* [NodeJS 8.10+ installed](https://nodejs.org/en/download/)
* [Docker installed](https://www.docker.com/community-edition)
* make

## Pre-requisites for a Windows environment
The following provide instructions how you can fulfill the requirements mentioned above on a Windows system.
* https://docs.aws.amazon.com/cli/latest/userguide/install-windows.html#install-msi-on-windows 
* https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install-windows.html
* MinGW with base MSYS package added to your PATH
* modify the --s3-bucket parameter in the makefile to point to your (manually) created S3 bucket
* Make sure you have set up logging (you'll have to create a dummy API GW for that): https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html 

`copy c:\MinGW\bin\mingw32-make.exe c:\MinGW\bin\make.exe`  
`copy c:\MinGW\bin\mingw32-make.exe c:\MinGW\bin\make.exe`  

## Getting started
`git clone https://github.com/JohanPeeters/rides-api.git`  
`cd rides-api`
`aws configure`  
`make deploy`

## Functions and their rationale

### options

The options lambda is named after the HTTP method that triggers it, `OPTIONS`. It is designed to respond to pre-flight CORS requests. So its main task is to inform the browser what it should do to protect the backend. A secondary goal is to leak as little information as possible about the constraints enforced by the backend. So the strategy is governed by a need-to-know policy. None of the CORS response headers are set if any of the requested features (origin, headers of method) are disallowed and requested features are reflected otherwise. This means that no information about acceptable features leaks until a call is attempted, forcing an attacker to work harder and make detection easier. `Access-Control-Expose-Headers` is never sent as the client has no need to know.

The API does not accept any cookies so `Access-Control-Allow-Credentials` is never sent back.

`Access-Control-Max-Age` of 600s affords performance optimization at negligible increased risk since the stack would need reconfiguration for CORS settings to change which requires human intervention.

### list

This method is triggered by a `GET` request on the rides collection. It does not take any parameters and returns up to 100 rides. These are not sorted and are not guaranteed to be the most recent ones - this is not a real-world application.

If the `Origin` header in the request is not in the range of allowed origins, a 403 response is returned with no results. Otherwise, the 200 response includes the `Access-Control-Allow-Origin` header with the value in the request's `Origin` header.

## Limitations

* *Authorizer:* `template.yaml` creates a Cognito User Pool called `riders`. It also creates an authorizer in the API that refers to the pool. Moreover, clients are created that can request tokens. One is called `test-client`, the other `ride-sharing`. The former is intended for test automation, the latter for a browser-based OAuth application. In order to start using the Cogito User Pool, the following remains to be done:
  * define a resource server that will consume access tokens with custom scopes:
    * the resource server represents the access controlled API. The resource server is assumed by the authorizer to be identified as `rides`, so make sure that this is the identifier you configure for the new resource server. This identifier string is what some other authorization server vendors refer to as the audience, often represented in JWT tokens in the `aud` claim;
    * scopes express permissions to perform actions on the API. The template configures various methods to  require the following scopes: `create`, `update` and `delete`. These scopes have to be added to the resource server. Note that the scope configuration on the API side concatenates the resource server identifier (`rides`) and the scope proper, e.g. `rides/update`, to form the scope string to be tested by the authorizer;
  * configure the test client to be allowed to request access tokens via the OAuth Client Credentials Grant. Make sure that the test client can request all access token scopes available - this should be `rides/create`, `rides/update` and `rides/delete`;
  * configure the `ride-sharing` app client to request access tokens via the OAuth Authorization Flow Grant. Make sure that the client can request all access token scopes available - this should be `rides/create`, `rides/update` and `rides/delete`;
  * set the sign in and sign out URLs for your clients.
* *CORS:* support for CORS is work-in-progress. The aim is to be as strict as possible with resources that can be shared, so no `Access-Control-Allow-Origin: *`. There is a proof of concept implementation for the `list` method. Also, the key `options` method has been implemented - see above. The other functions remain to be done.
* *Input validation:* API Gateway can be configured to perform input validation on the data sent to the API. While this would be useful in the case of the `create` and `put` methods, this remains to be done.
* *AWS WAF:* could be configured to provide further defense-in-depth. Since WAF pricing is fairly steep, I'm not sure that I want to do this.

### Manual tweaks

See the [Limitations](#limitations) section.
