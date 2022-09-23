import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {
    Instance,
    InstanceClass,
    InstanceSize,
    InstanceType, MachineImage,
    Peer,
    Port,
    SecurityGroup,
    SubnetType,
    Vpc
} from "aws-cdk-lib/aws-ec2";

export class CdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // VPC を作る
        const vpc = new Vpc(this, 'Vpc')

        // EC2 インスタンスを作る
        const ec2Instance = new Instance(this, 'EC2Instance', {
            instanceType: InstanceType.of(
                InstanceClass.T2,
                InstanceSize.MICRO
            ),
            machineImage: MachineImage.fromSsmParameter('/aws/service/ami-amazon-linux-latest/al2022-ami-kernel-5.15-x86_64'),
            vpc: vpc,
            vpcSubnets: vpc.selectSubnets({
                subnetType: SubnetType.PUBLIC,
            }),
        })
        const httpSecurityGroup = new SecurityGroup(this, 'AllowHTTPSecurityGroup', {
            vpc: vpc,
        })
        httpSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80))
        httpSecurityGroup.addIngressRule(Peer.anyIpv6(), Port.tcp(80))

        const sshSecurityGroup = new SecurityGroup(this, 'AllowSSHSecurityGroup', {
            vpc: vpc,
        })
        sshSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22))
        sshSecurityGroup.addIngressRule(Peer.anyIpv6(), Port.tcp(22))

        ec2Instance.addSecurityGroup(httpSecurityGroup)
        ec2Instance.addSecurityGroup(sshSecurityGroup)
    }
}
