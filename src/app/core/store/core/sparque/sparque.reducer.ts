/* eslint-disable ish-custom-rules/ban-imports-file-pattern */
import { createReducer } from '@ngrx/store';

import { environment } from '../../../../../environments/environment';

export interface SparqueState {
  url: string;
  wrapper_url: string;
  workspace: string;
  api: string;
}

const initialState: SparqueState = {
  url: environment.sparque ? environment.sparque.url : undefined,
  wrapper_url: environment.sparque ? environment.sparque.wrapper_url : undefined,
  workspace: environment.sparque ? environment.sparque.workspace : undefined,
  api: environment.sparque ? environment.sparque.api : undefined,
};

export const sparqueReducer = createReducer(initialState);
