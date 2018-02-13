import {VariableScope} from "../models/VariableScope";

export interface ScopedStates {
  global: VariableScope,
  shared: VariableScope
}
