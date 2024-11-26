export interface SparqueConfig {
  // base url of the sparque wrapper
  url: string;
  // version of the sparque wrapper REST API
  wrapperAPI: string;
  // sparque workspace name
  WorkspaceName: string;
  // sparque API name
  ApiName: string;
  // sparque deployment configuration e.g. production
  config?: string;

  [key: string]: unknown;
}
