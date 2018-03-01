import {StateScope} from "../models/StateScope";

export interface CombinedScopes {
  global: StateScope,
  shared: StateScope
}
