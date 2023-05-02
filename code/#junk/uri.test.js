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

var URI=require("src/main/node.js/core/work/uri");


describe("URI", function () {

	var specs="scheme://authority/path?query#fragment";
	var test=new URI(specs);


	describe("constructor", function () {

		describe("(specs:String)", function () {

			it("parses string specs", function () {

				expect(test.scheme).toEqual("scheme:");
				expect(test.authority).toEqual("//authority");
				expect(test.path).toEqual("/path");
				expect(test.query).toEqual("?query");
				expect(test.fragment).toEqual("#fragment");

			});

			it("returns instances of URI", function () {
				expect(test instanceof URI).toBe(true);
			});

		});

	});

	describe(".resolve", function () {

		describe("(specs:*):URI", function () {

			var tests={ // see http://tools.ietf.org/html/rfc3986#section-5.4

				"g:h": "g:h",
				"g": "http://a/b/c/g",
				"./g": "http://a/b/c/g",
				"g/": "http://a/b/c/g/",
				"/g": "http://a/g",
				"//g": "http://g",
				"?y": "http://a/b/c/d;p?y",
				"g?y": "http://a/b/c/g?y",
				"#s": "http://a/b/c/d;p?q#s",
				"g#s": "http://a/b/c/g#s",
				"g?y#s": "http://a/b/c/g?y#s",
				";x": "http://a/b/c/;x",
				"g;x": "http://a/b/c/g;x",
				"g;x?y#s": "http://a/b/c/g;x?y#s",
				"": "http://a/b/c/d;p?q",
				".": "http://a/b/c/",
				"./": "http://a/b/c/",
				"..": "http://a/b/",
				"../": "http://a/b/",
				"../g": "http://a/b/g",
				"../..": "http://a/",
				"../../": "http://a/",
				"../../g": "http://a/g",

				// Parsers must be careful in handling cases where there are more ".."
				// segments in a relative-path reference than there are hierarchical
				// levels in the base URI's path.  Note that the ".." syntax cannot be
				// used to change the authority component of a URI.

				"../../../g": "http://a/g",
				"../../../../g": "http://a/g",

				// Similarly, parsers must remove the dot-segments "." and ".." when
				// they are complete components of a path, but not when they are only
				// part of a segment.

				"/./g": "http://a/g",
				"/../g": "http://a/g",
				"g.": "http://a/b/c/g.",
				".g": "http://a/b/c/.g",
				"g..": "http://a/b/c/g..",
				"..g": "http://a/b/c/..g",

				// Less likely are cases where the relative reference uses unnecessary
				// or nonsensical forms of the "." and ".." complete path segments.

				"./../g": "http://a/b/g",
				"./g/.": "http://a/b/c/g/",
				"g/./h": "http://a/b/c/g/h",
				"g/../h": "http://a/b/c/h",
				"g;x=1/./y": "http://a/b/c/g;x=1/y",
				"g;x=1/../y": "http://a/b/c/y",

				// Some applications fail to separate the reference's query and/or
				// fragment components from the path component before merging it with
				// the base path and removing dot-segments.  This error is rarely
				// noticed, as typical usage of a fragment never includes the hierarchy
				// ("/") character and the query component is not normally used within
				// relative references.

				"g?y/./x": "http://a/b/c/g?y/./x",
				"g?y/../x": "http://a/b/c/g?y/../x",
				"g#s/./x": "http://a/b/c/g#s/./x",
				"g#s/../x": "http://a/b/c/g#s/../x",

				// Some parsers allow the scheme name to be present in a relative
				// reference if it is the same as the base URI scheme.  This is
				// considered to be a loophole in prior specifications of partial URI
				// [RFC1630].  Its use should be avoided but is allowed for backward
				// compatibility.

				"http:g": "http:g"
			};

			for (var p in tests) {
				if ( tests.hasOwnProperty(p) ) { test(p, tests[p]); }
			}

			function test(uri, expected) {
				it("passes RFC 3986 test case '"+p+"'", function () {
					expect(String(new URI("http://a/b/c/d;p?q").resolve(uri))).toEqual(expected);
				})
			}

		});

	});

	describe(".relativize", function () {

		describe("(specs:*):URI", function () {

			var tests={// see http://tools.ietf.org/html/rfc3986#section-5.4

				"g:h": "g:h", // different protocol
				"http://a/b/c/g": "g", // relative file
				"http://a/b/c/g/": "g/", // relative dir
				"http://a/g": "/g", // root file
				"http://a/g/": "/g/", // root dir
				"http://g": "//g", // same protocol
				"http://a/b/c/d;p?y": "?y", // different query
				"http://a/b/c/g?y": "g?y", // different file/query
				"http://a/b/c/d;p?q#s": "#s", // different hash
				"http://a/b/c/g#s": "g#s", // different file/hash
				"http://a/b/c/g?y#s": "g?y#s", // different file/query/hash
				"http://a/b/c/;x": ";x", // different tail
				"http://a/b/c/g;x": "g;x", // different file/tail
				"http://a/b/c/g;x?y#s": "g;x?y#s", // different file/tail/query/hash
				"http://a/b/c/d;p?q": "" // equal

			};

			for (var p in tests) {
				if ( tests.hasOwnProperty(p) ) { test(p, tests[p]); }
			}

			function test(uri, expected) {
				it("passes RFC 3986 test case '"+p+"'", function () {
					expect(String(new URI("http://a/b/c/d;p?q").relativize(uri))).toEqual(expected);
				})
			}

		});

	});

	describe("toString():String", function () {

		it("returns the original specs", function () {
			expect(String(test)).toEqual(specs);
		});

	});

});
