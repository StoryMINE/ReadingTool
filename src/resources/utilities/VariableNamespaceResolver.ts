import {VariableAccessor} from "../interfaces/VariableAccessor";
import {VariableReference} from "../models/VariableReference";
import {ReadingManager} from "../reading/ReadingManager";
import {Variable} from "../models/Variable";

export class VariableNamespaceResolver implements VariableAccessor {
    constructor(private varAccessor: VariableAccessor, private readingManager: ReadingManager) {}

    //Update "this" variables to to the correct namespace for the role.
    private resolveVarRefNamespace(varRef: VariableReference): VariableReference {
        if (varRef.namespace == "this") {
            let localUserRole = this.readingManager.getLocalUserRole();
            let newVarRef = varRef.clone();
            newVarRef.namespace = localUserRole ? localUserRole : this.readingManager.auth.userId;
            console.log("CURRENT ROLE: " + newVarRef.namespace);
            return newVarRef
        }
        return varRef;
    }

    get(varRef: VariableReference): Variable {
        return this.varAccessor.get(this.resolveVarRefNamespace(varRef));
    }

    save(varRef: VariableReference, value: string) {
        return this.varAccessor.save(this.resolveVarRefNamespace(varRef), value);
    }
}
