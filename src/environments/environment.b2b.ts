import { overrides } from './environment.development';
import { ENVIRONMENT_DEFAULTS, Environment } from './environment.model';

export const environment: Environment = {
  ...ENVIRONMENT_DEFAULTS,

  icmChannel: 'inSPIRED-inTRONICS_Business-Site',

  themeColor: '#688dc3',

  /**sparque: {
    url: 'http://localhost:5755',
    wrapperAPI: 'v2',
    WorkspaceName: 'soennecken',
    //WorkspaceName: 'intershop-project-base-v2-team2',
    ApiName: 'extended',
    //ApiName: 'PWA',
    //config: 'production',
  },**/

  features: [
    ...ENVIRONMENT_DEFAULTS.features,
    'businessCustomerRegistration',
    'costCenters',
    'maps',
    'punchout',
    'quickorder',
    'quoting',
    'orderTemplates',
  ],

  ...overrides,
};
