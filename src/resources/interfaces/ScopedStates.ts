import {StateScope} from "../models/VariableScope";

export interface ScopedStates {
  global: StateScope,
  shared: StateScope
}
