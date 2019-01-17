ride_sharing/node_modules:
	cd ride_sharing; npm install

packaged.yaml: ride_sharing/*.js ride_sharing/package.json template.yaml ride_sharing/node_modules
	sam validate
	sam package --template-file template.yaml --output-template-file packaged.yaml --s3-bucket access-controlled-serverless

deploy: packaged.yaml
	sam deploy --template-file packaged.yaml --stack-name access-controlled-serverless --capabilities CAPABILITY_IAM
