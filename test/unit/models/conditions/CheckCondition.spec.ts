/*******************************************************************
 *
 * StoryPlaces
 *
 This application was developed as part of the Leverhulme Trust funded
 StoryPlaces Project. For more information, please visit storyplaces.soton.ac.uk
 Copyright (c) $today.year
 University of Southampton
 Charlie Hargood, cah07r.ecs.soton.ac.uk
 Kevin Puplett, k.e.puplett.soton.ac.uk
 David Pepper, d.pepper.soton.ac.uk

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

import {TypeChecker} from "../../../../src/resources/utilities/TypeChecker";
import {CheckCondition} from "../../../../src/resources/models/conditions/CheckCondition";
import {VariableCollection} from "../../../../src/resources/collections/VariableCollection";
import {Container} from "aurelia-framework";
import {ConditionCollection} from "../../../../src/resources/collections/ConditionCollection";
import {LocationInformation} from "../../../../src/resources/gps/LocationInformation";
import {LocationCollection} from "../../../../src/resources/collections/LocationCollection";
import {VariableReference} from "../../../../src/resources/models/VariableReference";
import {Factory} from "aurelia-dependency-injection/dist/aurelia-dependency-injection";
import {State} from "../../../../src/resources/models/State";

describe("CheckCondition", () => {

    let typeChecker = new TypeChecker;
    let container;

    beforeEach(() => {
      container = new Container();
    });

    afterEach(() => {

    });

    it("can be created with no data", () => {
        let checkCondition = container.invoke(CheckCondition);

        expect(checkCondition instanceof CheckCondition).toBeTruthy();
    });

    it("can be created with data", () => {
      let checkCondition = container.invoke(CheckCondition);

        expect(checkCondition instanceof CheckCondition).toBeTruthy();
    });


    it("will throw an error if something other than an object is passed to fromObject", () => {
        let model = container.invoke(CheckCondition);

        expect(() => {
            model.fromObject([] as any)
        }).toThrow();

        expect(() => {
            model.fromObject("a" as any)
        }).toThrow();
    });

    //region variable

    it("can have variable set as a Variable Reference", () => {
        let checkCondition = container.invoke(CheckCondition, [{id: "a", variable: {id: "a", scope: "shared", namespace: "a"}}]);
        let varRef = container.invoke(VariableReference, [{id: "b", scope: "shared", namespace: "b"}]);
        checkCondition.variable = varRef;

        expect(checkCondition.variable).toEqual(varRef);
    });

    it("will throw an error if the a variable is not a a Variable Reference", () => {
        let checkCondition = container.invoke(CheckCondition);
        expect(() => {
            checkCondition.variable = 1 as any;
        }).toThrow();
    });
    //region

    describe("method execute", () => {
        let localContainer: Container;
        let state: State;
        let existingVarRef = {id:"TestVariable", variable: "TestVariable",  namespace: "a", scope:"shared"};
        let nonExistingVarRef = {id:"MysteryVariable", variable: "MysteryVariable", namespace: "a", scope:"shared"};

        beforeEach(() => {
          localContainer = new Container().makeGlobal();
          state = localContainer.invoke(State, [{id: "a", variables:[{id: "TestVariable", value:"something"}, {id: "NotTheTestVariable", value:"something"}]}]);
        });

        it("returns true if the variable exists", () => {
            let checkCondition = localContainer.invoke(CheckCondition, [{id: "TestCheck", variable: existingVarRef}]);

            let result = checkCondition.execute(state, {} as ConditionCollection, {} as LocationCollection, {} as LocationInformation);
            expect(result).toBeTruthy();
        });

        it("returns false if the variable doesn't exist", () => {
            let checkCondition = localContainer.invoke(CheckCondition, [{id: "TestCheck", variable: nonExistingVarRef}]);

            let result = checkCondition.execute(state, {} as ConditionCollection, {} as LocationCollection, {} as LocationInformation);
            console.log(result);
            expect(result).toBeFalsy();
        });
    });
});
