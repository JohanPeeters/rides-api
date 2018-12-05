ride_sharing/node_modules:
	cd ride_sharing; npm install

packaged.yaml: ride_sharing/*.js ride_sharing/package.json template.yaml openapi.yaml ride_sharing/node_modules
	sam validate
	sam package --template-file template.yaml --output-template-file packaged.yaml --s3-bucket ride-sharing-api

deploy: packaged.yaml
	sam deploy --template-file packaged.yaml --stack-name rides-api --capabilities CAPABILITY_IAM
