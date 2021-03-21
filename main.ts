import { Construct } from 'constructs';
import { App, TerraformStack, Token } from 'cdktf';
import { AwsProvider, Vpc, Subnet, InternetGateway, NatGateway, Eip } from './.gen/providers/aws';

class SampleCdktfStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    /** AwsProvider */
    new AwsProvider(this, 'sample-cdktf', {
      region: 'ap-northeast-1'
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
  }
}

const app = new App();
new SampleCdktfStack(app, 'sample-cdktf');
app.synth();
