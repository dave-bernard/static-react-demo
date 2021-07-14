import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deployment from "@aws-cdk/aws-s3-deployment";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Hosting bucket
    // make an s3 bucket to serve our stuff out of.
    const bucket = new s3.Bucket(this, "db-static-react-app-hosting", {
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    //2. Deployment bucket
    // Creates an intermediate bucket to receive our build files, zips them up and passes them into the hosting bucket.
    new s3Deployment.BucketDeployment(this, "db-static-react-app-deployment", {
      destinationBucket: bucket,
      sources: [s3Deployment.Source.asset("../build")],
    });

    //3. Add permission boundary
    const boundary = iam.ManagedPolicy.fromManagedPolicyArn(
      this,
      "Boundary",
      `arn:aws:iam::${process.env.AWS_ACCOUNT}:policy/ScopePermissions`
    );
    iam.PermissionsBoundary.of(this).apply(boundary);

    //4. Outputs
    new cdk.CfnOutput(this, 'Bucket URL', {
      value: bucket.bucketDomainName,
    });
  }
}
