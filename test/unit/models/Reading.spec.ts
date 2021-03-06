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
import {Reading} from "../../../src/resources/models/Reading";
import {TypeChecker} from "../../../src/resources/utilities/TypeChecker";
import {ReaderCollection} from "../../../src/resources/collections/ReaderCollection";

describe("Reading model", () => {
    let factoryCalledWith;
    let typeChecker;

    let exampleReadingObj;

    let factory = (data) => {
        factoryCalledWith = data;
        return undefined;
    }

    beforeEach(() => {
        factoryCalledWith = "set to something random";
        typeChecker = new TypeChecker;
        exampleReadingObj = {
          id: "1",
          storyId: "story",
          readers: [],
          sharedStates: [{
            id: "TestState",
            variables: []
          }]};
    });

    afterEach(() => {
        typeChecker = null;
    });

    it("can be instantiated with no data", () => {
        let model = new Reading(factory, factory, typeChecker);

        expect(model.id).toBeUndefined();
        expect(model.storyId).toBeUndefined();
        expect(factoryCalledWith).toBeUndefined();
    });

    it("can be instantiated with data", () => {
        let model = new Reading(factory, factory, typeChecker, exampleReadingObj);

        expect(model.id).toEqual("1");
        expect(model.storyId).toEqual("story");
        expect(model.readers).toBeUndefined();
        expect(model.sharedStates).toBeUndefined();
        expect(factoryCalledWith).toEqual(exampleReadingObj.sharedStates);
    });

    it("can have an anonymous object passed to it", () => {
        let model = new Reading(factory, factory, typeChecker);

        model.fromObject(exampleReadingObj);

        expect(model.id).toEqual("1");
        expect(model.storyId).toEqual("story");
        expect(model.readers).toBeUndefined();
        expect(model.sharedStates).toBeUndefined();
        expect(factoryCalledWith).toEqual(exampleReadingObj.sharedStates);
    });

    it("will throw an error if something other than an object is passed to fromObject", () => {
        let model = new Reading(factory, factory, typeChecker);

        expect(() => {
            model.fromObject([] as any)
        }).toThrow();

        expect(() => {
            model.fromObject("a" as any)
        }).toThrow();
    });


    it("will throw an error when readingId is set to something other than a string or undefined", () => {
        let model = new Reading(factory, factory, typeChecker);
        expect(() => {
            model.id = 1 as any
        }).toThrow();
    });

    it("will throw an error when readers is set to something other than a ReaderCollection or undefined", () => {
        let model = new Reading(factory, factory, typeChecker);

        expect(() => {
            model.readers = 1 as any;
        }).toThrow();
    });

    describe("variable state", () => {
        it("can be set to notstarted", () => {
            let model = new Reading(factory, factory, typeChecker);
            model.state = "notstarted";
            expect(model.state).toEqual("notstarted");
        });

        it("can be set to inprogress", () => {
            let model = new Reading(factory, factory, typeChecker);
            model.state = "inprogress";
            expect(model.state).toEqual("inprogress");
        });

        it("can be set to finished", () => {
            let model = new Reading(factory, factory, typeChecker);
            model.state = "closed";
            expect(model.state).toEqual("closed");
        });

        it("will throw when set to something else", () => {
            let model = new Reading(factory, factory, typeChecker);
            expect(() => {model.state = "something random";}).toThrow();
        });
    });

    it("will throw an error when sharedStates is set to something other than an instance of StateScope", () => {
        let model = new Reading(factory, factory, typeChecker);

        expect(() => {
            model.sharedStates = 1 as any
        }).toThrow();
    });

    it("can be cast to JSON", () => {
        let model = new Reading(factory, factory, typeChecker, exampleReadingObj);

        let result = JSON.stringify(model);

        //TODO: Make this a better test as variables is missed off
        expect(result).toEqual('{"id":"1","storyId":"story","state":"notstarted"}');
    });
});
