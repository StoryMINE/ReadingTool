import {CombinedScopes} from "./ScopedStates";

export interface UpdateStatesResponse {
  collision: boolean;
  scopes: CombinedScopes;
}
