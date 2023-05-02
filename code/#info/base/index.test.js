/*
 * Copyright © 2020-2023 Metreeca srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var base=require("src/main/node.js/info/units/base");

var core=require("metreeca-core");

var d3=require("d3");

//// Helpers ///////////////////////////////////////////////////////////////////////////////////////////////////////////

describe("base.cell(series:{}):(data)=>cell", function () {

	it("returns a composite accessor", function () {

		var data={

			a: 1,
			b: 2

		};

		var meta={

			x: function (d) { return d.a; },
			y: function (d) { return d.b; },
			c: function (d) { return (d.a+d.b)/2; }

		};

		expect(base.cell(meta)(data)).toEqual({

			data: data,
			meta: meta,

			x: 1,
			y: 2,
			c: 1.5

		});

	});

});

describe("base.point(value):{x,y}", function () {

	it("rejects nil values", function () {
		expect(base.point(null)).toBeUndefined();
	});

	it("converts objects", function () {
		expect(base.point({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 });
		expect(base.point({ x: "1", w: "!" })).toEqual({ x: 1, y: 0, w: "!" });
	});

	it("converts arrays", function () {
		expect(base.point([1, 2])).toEqual({ x: 1, y: 2 });
		expect(base.point(["1"])).toEqual({ x: 1, y: 0 });
	})

});

//// Value Converters //////////////////////////////////////////////////////////////////////////////////////////////////

describe("base.series", function () {

	describe("(accessor:function):function", function () {

		it("returns accessors", function () {

			var series=function () {};

			expect(base.series(series)).toBe(series);
		});

		it("returns generated accessors", function () {

			var x=base.series("x");
			var one=base.series(1);

			expect(String(x)).toEqual("x");
			expect(x({ x: "x!" })).toEqual("x!");

			expect(String(one)).toEqual("1");
			expect(one({ 1: "1!" })).toEqual("1!");
		});

		it("rejects nil values", function () {
			expect(base.series(null)).toBeUndefined();
		});

	});

	describe("(array:*[]):function[]", function () {

		it("applies conversion to array items", function () {

			var x=base.series([function x(d) { return d.x; }])[0];

			expect(String(x)).toEqual("x");
			expect(x({ x: "x!" })).toEqual("x!");
		});

	});

});

describe("base.colors", function () {

	describe("(scale:d3.scale):d3.scale", function () {

		it("returns the given d3 color scale", function () {
			expect(base.colors(d3.scale.category20c()).range()).toEqual(d3.scale.category20c().range());
		});

	});

	describe("(scale:string):d3.scale", function () {

		it("returns the named d3 color scale", function () {
			expect(base.colors("category20c").range()).toEqual(d3.scale.category20c().range());
		});

	});

	describe("([colors]:string):d3.scale", function () {

		it("returns a d3 color scale built using the given color names as converted by d3.rgb()", function () {
			expect(core.equals(
					base.colors(["rgb(255,0,0)", "green", "#00F"]).range(),
					[
						{ r: 255, g: 0, b: 0 },
						{ r: 0, g: 128, b: 0 },
						{ r: 0, g: 0, b: 255 }
					]
			)).toBe(true);
		});

	});

	describe("(*):undefined", function () {

		it("returns undefined for unrecognized specs", function () {
			expect(base.colors({})).toBeUndefined();
		});

	});

});


describe("base.boolean", function () {

	describe("(value:*):boolean", function () {

		it("returns booleans", function () {
			expect(base.boolean(true)).toBe(true);
		});

		it("returns converted values", function () {
			expect(base.boolean(123)).toBe(true);
		});

		it("converts textual values", function () {
			expect(base.boolean("true")).toBe(true);
			expect(base.boolean("false")).toBe(false);
			expect(base.boolean("yes")).toBe(true);
			expect(base.boolean("no")).toBe(false);
			expect(base.boolean("on")).toBe(true);
			expect(base.boolean("off")).toBe(false);
		});

		it("rejects nil values", function () {
			expect(base.boolean(null)).toBeUndefined();
		});

	});

	describe("(accessor:(...args:*)=>*):boolean", function () {

		it("wraps accessors converting results", function () {

			var test=base.boolean(function (key, data) { return data[key] });

			expect(test("boolean", { boolean: 1 })).toBe(true);

		});

		it("wraps accessors delegating toString()", function () {

			var test=base.boolean(base.label(function test(key, data) { return data[key] }));

			expect(test.toString()).toEqual("test");

		});

	});

	describe("(array:*[]):*[]", function () {

		it("applies conversion to array items", function () {
			expect(base.boolean([true, "1", ""])).toEqual([true, true, false]);
		});

	});

});

describe("base.number", function () {

	describe("(value:*, lower?:number, upper?:number):number", function () {

		it("returns numbers", function () {
			expect(base.number(123)).toEqual(123);
		});

		it("returns converted numeric values", function () {
			expect(base.number("123")).toEqual(123);
		});

		it("accepts zero values", function () {
			expect(base.number(0)).toEqual(0);
		});

		it("rejects non-numeric values", function () {
			expect(base.number("text!")).toBeUndefined();
		});

		it("rejects nil values", function () {
			expect(base.number(null)).toBeUndefined();
		});

		it("clips values outside range", function () {
			expect(base.number(-10, 0, 1)).toEqual(0);
			expect(base.number(10, 0, 1)).toEqual(1);
		});
	});

	describe("(accessor:(...args:*)=>*):(...args:*)=>number", function () {

		it("wraps accessors converting results", function () {

			var test=base.number(function (key, data) { return data[key] });

			expect(test("number", { number: 123 })).toEqual(123);
			expect(test("numeric", { numeric: "123" })).toEqual(123);
			expect(test("textual", { numeric: "text!" })).toBeUndefined();

		});

		it("wraps accessors delegating toString()", function () {

			var test=base.number(base.label(function test(key, data) { return data[key] }));

			expect(test.toString()).toEqual("test");

		});

	});

	describe("(array:*[]):*[]", function () {

		it("applies conversion to array items", function () {
			expect(base.number([1, "2", "x"])).toEqual([1, 2, undefined]);
		});

	});

});

describe("base.string", function () {

	describe("(value:*):string", function () {

		it("returns strings", function () {
			expect(base.string("text")).toEqual("text");
		});

		it("returns converted values", function () {
			expect(base.string(123)).toEqual("123");
		});

		it("rejects nil values", function () {
			expect(base.string(null)).toBeUndefined();
		});

	});

	describe("(accessor:(...args:*)=>*):string", function () {

		it("wraps accessors converting results", function () {

			var test=base.string(function (key, data) { return data[key] });

			expect(test("textual", { textual: "text" })).toEqual("text");

		});

		it("wraps accessors delegating toString()", function () {

			var test=base.string(base.label(function test(key, data) { return data[key] }));

			expect(test.toString()).toEqual("test");

		});

	});

	describe("(array:*[]):*[]", function () {

		it("applies conversion to array items", function () {
			expect(base.string([1, "2", "x"])).toEqual(["1", "2", "x"]);
		});

	});

});

describe("base.array", function () {

	describe("(value:*):*[]", function () {

		it("returns arrays", function () {
			expect(base.array([1, 2, 3])).toEqual([1, 2, 3]);
		});

		it("returns wrapped values", function () {
			expect(base.array(123)).toEqual([123]);
		});

		it("rejects nil values", function () {
			expect(base.array(null)).toBeUndefined();
		});

	});

});

describe("base.lambda", function () {

	var lambda=function () {};

	describe("(value:*):function", function () {

		it("returns functions", function () {
			expect(base.lambda(lambda)).toBe(lambda);
		});

		it("wraps constants", function () {
			expect(base.lambda(123)()).toEqual(123);
		});

		it("rejects nil values", function () {
			expect(base.lambda(null)).toBeUndefined();
		});

	});

	describe("(array:*[]):function[]", function () {

		it("applies conversion to array items", function () {

			var test=base.lambda([lambda, 123]);

			expect(test[0]).toEqual(lambda);
			expect(test[1]()).toEqual(123);
		});

	});
});
