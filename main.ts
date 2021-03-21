import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';

class SampleCdktfStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here
  }
}

const app = new App();
new SampleCdktfStack(app, 'sample-cdktf');
app.synth();
