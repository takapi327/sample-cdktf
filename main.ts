import { Construct } from 'constructs';
import { App, TerraformStack, Token } from 'cdktf';
import {
  AwsProvider,
  IamRole,
  IamPolicy,
  IamRolePolicyAttachment,
  Vpc,
  Subnet,
  InternetGateway,
  NatGateway,
  Eip,
  RouteTable,
  RouteTableAssociation,
  SecurityGroup,
  SecurityGroupRule,
  Alb,
  AlbTargetGroup,
  AlbListener,
  AlbListenerRule,
  EcsCluster,
  EcrRepository,
  EcsTaskDefinition,
  EcsService,
  S3Bucket
} from './.gen/providers/aws';

class SampleCdktfStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    /** AwsProvider */
    new AwsProvider(this, 'sample-cdktf', {
      region: 'ap-northeast-1'
    });

    /** Role */
    const ecsTaskRole = new IamRole(this, 'ecsTaskRole', {
      name: 'sample-cdktf-ecsTaskRole',
      assumeRolePolicy: `{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Action": "sts:AssumeRole",
            "Principal": {
              "Service": "ecs-tasks.amazonaws.com"
          },
          "Effect": "Allow",
          "Sid": ""
          }
        ]
      }`
    });

    const ecsTaskIamPolicy = new IamPolicy(scope, 'ecs-task-policy', {
      name:        'ecs-task-policy',
      description: 'Policy for updating ECS tasks',
      policy: `{
        "Version":   "2012-10-17",
        "Statement": [
          {
            "Action": [
              "ecs:DescribeServices",
              "ecs:CreateTaskSet",
              "ecs:UpdateServicePrimaryTaskSet",
              "ecs:DeleteTaskSet",
              "elasticloadbalancing:DescribeTargetGroups",
              "elasticloadbalancing:DescribeListeners",
              "elasticloadbalancing:ModifyListener",
              "elasticloadbalancing:DescribeRules",
              "elasticloadbalancing:ModifyRule",
              "lambda:InvokeFunction",
              "cloudwatch:DescribeAlarms",
              "sns:Publish",
              "s3:GetObject",
              "s3:GetObjectVersion"
            ],
            "Resource": [
              "*"
            ],
            "Effect": "Allow"
          }
        ]
      }`
    });

    new IamRolePolicyAttachment(scope, 'attach-ecs-task-policy', {
      role:      ecsTaskRole.name,
      policyArn: ecsTaskIamPolicy.arn
    });

    const ecsTaskExecutionRole = new IamRole(this , 'ecsTaskExecutionRole',{
      name: 'sample-cdktf-ecsTaskExecutionRole',
      assumeRolePolicy: `{
        "Version":   "2012-10-17",
        "Statement": [
          {
            "Action":    "sts:AssumeRole",
            "Principal": {
              "Service": "ecs-tasks.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid":    ""
          }
        ]
      }`
    });

    const ecsTaskExecutionIamPolicy = new IamPolicy(scope, 'ecs-task-execution-policy', {
      name:        'ecs-task-execution-policy',
      description: 'Policy for updating ECS tasks',
      policy: `{
        "Version":   "2012-10-17",
        "Statement": [
          {
            "Action": [
              "ecr:GetAuthorizationToken",
              "ecr:BatchCheckLayerAvailability",
              "ecr:GetDownloadUrlForLayer",
              "ecr:BatchGetImage",
              "logs:CreateLogStream",
              "logs:PutLogEvents"
            ],
            "Resource": [
              "*"
            ],
            "Effect": "Allow"
          }
        ]
      }`
    });

    new IamRolePolicyAttachment(scope, 'attach-ecs-task-execution-policy', {
      role:      ecsTaskExecutionRole.name,
      policyArn: ecsTaskExecutionIamPolicy.arn
    });

    /** VPC */
    const vpc = new Vpc(this, 'sample-cdktf-vpc', {
      cidrBlock:         '10.0.0.0/16',
      enableDnsHostnames: true,
      tags:               { ['Name']: 'sample-cdktf production' }
    });

    /** Public Subnet */
    const publicSubnet1  = new Subnet(this, 'sample-cdktf-public-subnet1', {
      vpcId:               Token.asString(vpc.id),
      availabilityZone:    'ap-northeast-1a',
      cidrBlock:           '10.0.0.0/20',
      mapPublicIpOnLaunch: true,
      tags:                { ['Name']: 'Public1 AZ1a sample-cdktf' }
    });

    const publicSubnet2  = new Subnet(this, 'sample-cdktf-public-subnet2', {
      vpcId:               Token.asString(vpc.id),
      availabilityZone:    'ap-northeast-1c',
      cidrBlock:           '10.0.16.0/20',
      mapPublicIpOnLaunch: true,
      tags:                { ['Name']: 'Public2 AZ1c sample-cdktf' }
    });

    /** Private Subnet */
    const privateSubnet1  = new Subnet(this, 'sample-cdktf-private-subnet1', {
      vpcId:               Token.asString(vpc.id),
      availabilityZone:    'ap-northeast-1a',
      cidrBlock:           '10.0.128.0/20',
      mapPublicIpOnLaunch: true,
      tags:                { ['Name']: 'Private1 AZ1a sample-cdktf' }
    });

    const privateSubnet2  = new Subnet(this, 'sample-cdktf-private-subnet2', {
      vpcId:               Token.asString(vpc.id),
      availabilityZone:    'ap-northeast-1c',
      cidrBlock:           '10.0.144.0/20',
      mapPublicIpOnLaunch: true,
      tags:                { ['Name']: 'Private2 AZ1c sample-cdktf' }
    });

    /** InternetGateway */
    const internetGateway = new InternetGateway(this, 'sample-cdktf-igw-production', {
      vpcId: Token.asString(vpc.id),
      tags:  { ['Name']: 'igw-production sample-cdktf' }
    });

    /** NatGateway */
    const eip = new Eip(this, 'sample-cdktf-eip', {
      vpc: true
    });
    const natGateway = new NatGateway(this, 'sample-cdktf-nat-gateway', {
      allocationId: Token.asString(eip.id),
      subnetId:     Token.asString(publicSubnet1.id),
      tags:         { ['Name']: 'sample-cdktf nat-gateway-production' }
    });

    /** Public Route Table */
    const publicRouteTable = new RouteTable(this, 'sample-cdktf-public-rtb', {
      vpcId: Token.asString(vpc.id),
      route: [{
        cidrBlock:              '0.0.0.0/0',
        gatewayId:              Token.asString(internetGateway.id),
        ipv6CidrBlock:          '',
        egressOnlyGatewayId:    '',
        instanceId:             '',
        natGatewayId:           '',
        networkInterfaceId:     '',
        transitGatewayId:       '',
        vpcPeeringConnectionId: ''
      }],
      tags: { ['Name']: 'sample-cdktf Public rtb' }
    });

    /**　Private Route Table　*/
    const privateRouteTable =　new RouteTable(this, 'sample-cdktf-private-rtb', {
      vpcId:Token.asString(vpc.id),
      route: [{
        cidrBlock:              '0.0.0.0/0',
        gatewayId:              '',
        ipv6CidrBlock:          '',
        egressOnlyGatewayId:    '',
        instanceId:             '',
        natGatewayId:           Token.asString(natGateway.id),
        networkInterfaceId:     '',
        transitGatewayId:       '',
        vpcPeeringConnectionId: ''
      }],
      tags: { ['Name']: 'sample-cdktf Private rtb' }
    });

    /** Association to Public RouteTable */
    new RouteTableAssociation(this, 'sample-cdktf-public-rtb-association1', {
      routeTableId: Token.asString(publicRouteTable.id),
      subnetId:     Token.asString(publicSubnet1.id)
    });
    new RouteTableAssociation(this, 'sample-cdktf-public-rtb-association2', {
      routeTableId: Token.asString(publicRouteTable.id),
      subnetId:     Token.asString(publicSubnet2.id)
    });

    /** Association to Private RouteTable */
    new RouteTableAssociation(this, 'sample-cdktf-private-rtb-association1', {
      routeTableId: Token.asString(privateRouteTable.id),
      subnetId:     Token.asString(privateSubnet1.id)
    });
    new RouteTableAssociation(this, 'sample-cdktf-private-rtb-association2', {
      routeTableId: Token.asString(privateRouteTable.id),
      subnetId:     Token.asString(privateSubnet2.id)
    });

    /** SecurityGroup */
    const security = new SecurityGroup(this, 'sample-cdktf-security-group', {
      name:  'sample-cdktf',
      vpcId: Token.asString(vpc.id),
      tags:  { ['Name']: 'sample-cdktf' }
    });

    /** SecurityGroup Rule */
    new SecurityGroupRule(this, 'sample-cdktf-security-ingress', {
      cidrBlocks:      ['0.0.0.0/0'],
      fromPort:        80,
      protocol:        'tcp',
      securityGroupId: Token.asString(security.id),
      toPort:          80,
      type:            'ingress'
    });
    new SecurityGroupRule(this, 'sample-cdktf-security-egress', {
      cidrBlocks:      ['0.0.0.0/0'],
      fromPort:        0,
      protocol:        'all',
      securityGroupId: Token.asString(security.id),
      toPort:          0,
      type:            'egress'
    });

    /** ApplicationLoadBalancer */
    const alb = new Alb(this, 'sample-cdktf-alb', {
      name:             'sample-cdktf-alb',
      internal:         false,
      loadBalancerType: 'application',
      securityGroups:   [Token.asString(security.id), Token.asString(vpc.defaultSecurityGroupId)],
      subnets:          [Token.asString(publicSubnet1.id), Token.asString(publicSubnet2.id)],
      ipAddressType:    'ipv4',
      enableHttp2:      true
    });

    const albTargetGroup = new AlbTargetGroup(scope, 'sample-cdktf-alb-target-group', {
      name:       'sample-cdktf-alb-target-group',
      port:       80,
      protocol:   'HTTP',
      targetType: 'ip',
      vpcId:      Token.asString(vpc.id),
      healthCheck: [{
        interval:           30,
        path:               '/',
        port:               'traffic-port',
        protocol:           'HTTP',
        timeout:            5,
        unhealthyThreshold: 2
      }]
    });

    const albListener = new AlbListener(scope, 'sample-cdktf-alb-listener', {
      loadBalancerArn: Token.asString(alb.arn),
      port:            80,
      protocol:        'HTTP',
      defaultAction:   [{
        targetGroupArn: Token.asString(albTargetGroup.arn),
        type:           'forward'
      }]
    });

    new AlbListenerRule(this, 'sample-cdktf-alb-listener-rule', {
      listenerArn: albListener.arn,
      priority:    100,
      action:      [{
        type:          'forward',
        targetGroupArn: albTargetGroup.arn
      }],
      condition: [{
        field: 'path-pattern',
        values: ['*']
      }]
    });

    /** ElasticContainerService */
    const ecsCluster = new EcsCluster(this, 'sample-cdktf-cluster', {
      name: 'sample-cdktf-cluster'
    });

    const ecsRepository = new EcrRepository(this, 'sample-cdktf-repository', {
      name: 'project/sample-cdktf'
    });

    const containerDefinition: string = `[
      {
        "essential":    true,
        "name":         "sample-cdktf-container",
        "image":        "${ecsRepository.repositoryUrl}:latest",
        "portMappings": [
          {
            "hostPort":      9000,
            "protocol":      "tcp",
            "containerPort": 9000
          }
        ],
        "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
            "awslogs-group":         "/aws/ecs/sample-cdktf-task",
            "awslogs-stream-prefix": "ecs",
            "awslogs-region":        "ap-northeast-1"
          }
        }
      }
    ]`
    const ecsTaskDefinition = new EcsTaskDefinition(this, 'sample-cdktf-task', {
      containerDefinitions:    containerDefinition,
      family:                  'task-for-cdktf',
      networkMode:             'awsvpc',
      executionRoleArn:        ecsTaskExecutionRole.arn,
      taskRoleArn:             ecsTaskRole.arn,
      cpu:                     '512',
      memory:                  '1024',
      requiresCompatibilities: [ 'FARGATE' ]
    });

    new EcsService(this, 'sample-cdktf-ecs-service', {
      cluster:                         Token.asString(ecsCluster.id),
      deploymentMaximumPercent:        200,
      deploymentMinimumHealthyPercent: 100,
      desiredCount:                    1,
      launchType:                      'FARGATE',
      name:                            'sample-cdktf-ecs-service',
      platformVersion:                 'LATEST',
      taskDefinition:                  Token.asString(ecsTaskDefinition.id),
      networkConfiguration:            [{
        securityGroups: [Token.asString(vpc.defaultSecurityGroupId)],
        subnets:        [Token.asString(privateSubnet1.id)]
      }],
      loadBalancer: [{
        containerName:  'sample-cdktf-container',
        containerPort:  9000,
        targetGroupArn: albTargetGroup.arn
      }]
    });

    const s3Bucket = new S3Bucket(scope, 'sample-cdktf-s3', {
      bucket: 'sample-cdktf-s3',
      region: 'ap-northeast-1'
    });
  }
}

const app = new App();
new SampleCdktfStack(app, 'sample-cdktf');
app.synth();
