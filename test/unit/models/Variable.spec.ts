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
import {Variable} from "../../../src/resources/models/Variable";
import {TypeChecker} from "../../../src/resources/utilities/TypeChecker";

describe("Variable model", () => {
    let typeChecker = new TypeChecker;

    it("can be instantiated with no data", () => {
        let model = new Variable(typeChecker);

        expect(model.id).toBeUndefined();
        expect(model.value).toBeUndefined();
    });

    it("can be instantiated with an object", () => {
        let data = {id: "1", value: "a"};
        let model = new Variable(typeChecker, data);

        expect(model.id).toEqual("1");
        expect(model.value).toEqual("a");
    });

    it("can have an anonymous object passed to it", () => {
        let data = {id: "1", value: "a"};
        let model = new Variable(typeChecker);
        model.fromObject(data);

        expect(model.id).toEqual("1");
        expect(model.value).toEqual("a");
    });

    it("will throw an error if something other than an object is passed to fromObject", () => {
        let model = new Variable(typeChecker);

        expect(() => {
            model.fromObject([] as any)
        }).toThrow();
        expect(() => {
            model.fromObject("a" as any)
        }).toThrow();
    });

    it("will convert to JSON", () => {
        let data = {id: "1", value: "a"};
        let model = new Variable(typeChecker, data);

        let result = JSON.stringify(model);

        expect(result).toEqual('{"id":"1","value":"a"}');
    });

    it("will throw an error if value is set to something other than a string", () => {
        let model = new Variable(typeChecker);


        expect(() => {
            model.value = 1 as any
        }).toThrow();
    });
});