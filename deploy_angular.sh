#!/bin/bash
set +e

source ./script/exports.sh

AWS_DEFAULT_REGION='us-east-1'
env=" /delta/account/environment"
VPC_ID_SSM=' /delta/vpc/vpcid'
SUBNET1_ID_SSM=' /delta/vpc/privatesubnet1aid'
SUBNET2_ID_SSM=' /delta/vpc/privatesubnet2aid'


# get account id
AWS_ACCOUNT=$(aws sts get-caller-identity --output text --query Account)
echo "ACCOUNT_ID=$AWS_ACCOUNT"

# fetching ssm parameters provided by foundations team for the environment
echo "env=${env}"
ENV=$(aws ssm get-parameter --name "${env}" --region ${AWS_DEFAULT_REGION} --output text --query Parameter.Value)
echo "ENVIRONMENT=$ENV"


echo "VPC_ID_SSM=${VPC_ID_SSM}"
VPC_ID=$(aws ssm get-parameter --name "${VPC_ID_SSM}" --region ${AWS_DEFAULT_REGION} --output text --query Parameter.Value)
echo "VPC_ID=$VPC_ID"

SUBNET1_ID=$(aws ssm get-parameter --name "${SUBNET1_ID_SSM}" --region ${AWS_DEFAULT_REGION} --output text --query Parameter.Value)
SUBNET2_ID=$(aws ssm get-parameter --name "${SUBNET2_ID_SSM}" --region ${AWS_DEFAULT_REGION} --output text --query Parameter.Value)
echo "SUBNETS=$SUBNET1_ID,$SUBNET2_ID"

# Prompt for Pipeline Deployment Variables

# Read CodeBaseGitUrl value from user
echo "Enter CodeBaseGitUrl:"
read UserInputCodeBaseGitUrl


# Read CodeBaseAccessTokenUserName value from user
echo "Enter AppCode AccessToken UserName:"
read UserInputCodeBaseAccessTokenUserName

# Read CodeBaseAccessTokenPassword value from user
echo "Enter AppCode AccessToken Password:"
read UserInputCodeBaseAccessTokenPassword


# Read SecurityGroup created in the gitlab-custom-source stack
SEC_GROUP=$(aws ec2 describe-security-groups --filters Name=group-name,Values=gitlab-custom-source-GitPullSecurityGroup-* --query "SecurityGroups[*].{ID:GroupId}" --output text)
[ -n "${SEC_GROUP}" ] || { echo "SecurityGroup is not defined"; exit 1; }


#Create the pipeline app

# ------------------------
# Deploying Pipeline app


deploy_pipeline_app_stack() {
  aws --region ${AWS_DEFAULT_REGION} cloudformation deploy \
   --stack-name "${RESOURCE_PREFIX}-${STACK_NAME}" \
   --template-file ./iac/aws/template.yml \
   --parameter-overrides \
   "GitPullVpc=$VPC_ID" \
   "GitPullSubnet=$SUBNET1_ID,$SUBNET2_ID" \
   "SecurityGroup=$SEC_GROUP" \
   "CodeBaseGitUrl=$UserInputCodeBaseGitUrl" \
   "CodeBaseAccessTokenUserName=$UserInputCodeBaseAccessTokenUserName" \
   "CodeBaseAccessTokenPassword=$UserInputCodeBaseAccessTokenPassword" \
   "PrefixLabel"=$RESOURCE_PREFIX \
   "SiteBucketName"=$BUCKET_NAME \
   "CodeBaseGitUrl"=$GIT_REPO \
   "CodeBaseBranch"=$GIT_BRANCH \
   --capabilities CAPABILITY_NAMED_IAM \
   --no-fail-on-empty-changeset
}


if ! aws cloudformation describe-stacks --stack-name "${RESOURCE_PREFIX}-${STACK_NAME}" --query "Stacks[].StackId" --region ${AWS_DEFAULT_REGION} >/dev/null 2>&1; then
  echo "${RESOURCE_PREFIX}-${STACK_NAME} stack does not exist, creating"
  deploy_pipeline_app_stack  
  else
  echo "Stack name angular-stack already exist, please delete the stack and re sun the script again!"
fi
