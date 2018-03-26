// Formerly in Reading Manager.
// Removed as accessing it as a static caused a circular dependency injection bug. Somehow.
import {Role} from "../models/Role";
import {VariableAccessor} from "../interfaces/VariableAccessor";
import {Story} from "../models/Story";
import {VariableReference} from "../models/VariableReference";
import {TypeChecker} from "./TypeChecker";

export let RolesOccupiedNamespace: string = "_rolesOccupied";

export function CreateUserRoleAssignmentVarRef(userId): VariableReference {
    return new VariableReference(new TypeChecker(), {
        scope: "shared",
        namespace: RolesOccupiedNamespace,
        variable: userId
    });
}

export function GetUserRole(userId: string, variables: VariableAccessor, story: Story): Role {
    let roleAssignmentVariable = variables.get(CreateUserRoleAssignmentVarRef(userId));

    if(!roleAssignmentVariable) { return; }

    return story.roles.get(roleAssignmentVariable.value);
}
