/*******************************************************************
 *
 * StoryPlaces
 *
 This application was developed as part of the Leverhulme Trust funded
 StoryPlaces Project. For more information, please visit storyplaces.soton.ac.uk
 Copyright (c) 2016
 University of Southampton
 Charlie Hargood, cah07r.ecs.soton.ac.uk
 Kevin Puplett, k.e.puplett.soton.ac.uk
 David Pepper, d.pepper.soton.ac.uk
 Callum Spawforth, cs14g13.ecs.soton.ac.uk

 All rights reserved.
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * The name of the University of Southampton nor the name of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE ABOVE COPYRIGHT HOLDERS BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import {TypeChecker} from "../../utilities/TypeChecker";
import {inject} from "aurelia-framework";
import {BaseFunction} from "./BaseFunction";
import {ConditionCollection} from "../../collections/ConditionCollection";
import {LocationCollection} from "../../collections/LocationCollection";
import {LocationInformation} from "../../gps/LocationInformation";
import {LoggingHelper} from "../../logging/LoggingHelper";
import {FunctionCollection} from "../../collections/FunctionCollection";
import {VariableAccessor} from "../../interfaces/VariableAccessor";
import {Authenticator} from "../../auth/Authenticator";
import {Story} from "../Story";
import {Reading} from "../Reading";
import {Role} from "../Role";
import {CreateUserRoleAssignmentVarRef} from "../../utilities/RoleManagement";

@inject(TypeChecker,
    LoggingHelper,
    Authenticator)

export class SetRoleFunction extends BaseFunction {

    private _value: string;

    constructor(typeChecker: TypeChecker,
                private loggingHelper: LoggingHelper,
                private auth: Authenticator,
                data?: any) {
        super(typeChecker);

        if (data) {
            this.fromObject(data);
        }
    }

    fromObject(data = {id: undefined, value: undefined, conditions: undefined}) {
        this.typeChecker.validateAsObjectAndNotArray("Data", data);
        this.id = data.id;
        this.value = data.value;
        this.conditions = data.conditions;
    }

    toJSON() {
        return {
            id: this.id,
            type: "setrole",
            value: this.value,
            conditions: this.conditions
        };
    }

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this.typeChecker.validateAsStringOrUndefined("Value", value);
        this._value = value;
    }

    execute(story: Story, reading: Reading, variables: VariableAccessor, conditions: ConditionCollection, functions: FunctionCollection, locations: LocationCollection, userLocation: LocationInformation): any {
        if (!this.allConditionsPass(variables, conditions, locations, userLocation)) {
            return;
        }

        let role = story.roles.get(this.value);
        let roleAssignmentVarRef = CreateUserRoleAssignmentVarRef(this.auth.userId);

        variables.save(roleAssignmentVarRef, role.id);

        this.loggingHelper.logChangeVariable(story.id, reading.id, this.auth.userId, role.id);
    }
}
