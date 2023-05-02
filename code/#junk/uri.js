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

var core=require("metreeca-core");


module.exports=core.type({

    new: function URI(specs) {

        specs=core.isNil(specs) ? {} : core.isString(specs) ? parse(specs) : specs;

        this.scheme=specs.scheme || "";
        this.authority=specs.authority || "";
        this.path=specs.path || "";
        this.query=specs.query || "";
        this.fragment=specs.fragment || "";

        this.specs=this.scheme+this.authority+this.path+this.query+this.fragment; // !!! normalize path for comparison

    },


    resolve: function (uri) { // see http://tools.ietf.org/html/rfc3986#section-5.4
        if (uri instanceof this.constructor) {

            return new this.constructor({

                scheme: uri.scheme ? uri.scheme : this.scheme,

                authority: uri.scheme || uri.authority ? uri.authority : this.authority,

                query: uri.scheme || uri.authority || uri.path || uri.query ? uri.query : this.query,

                path: clean(uri.scheme || uri.authority ? uri.path // !!! review/refactor
                    : !uri.path ? this.path
                        : uri.path.charAt(0) === "/" ? uri.path
                            : this.path ? this.path.substr(0, this.path.lastIndexOf("/")+1)+uri.path
                                : "/"+uri.path),

                fragment: uri.fragment

            });

        } else {
            return this.resolve(new this.constructor(uri));
        }
    },

    relativize: function (uri) { // see http://tools.ietf.org/html/rfc3986#section-5.4
        if (uri instanceof this.constructor) {

            var bpath=clean(this.path);
            var bslash=bpath.lastIndexOf("/");
            var bhead=bslash >= 0 ? bpath.substring(0, bslash+1) : bpath;

            var upath=clean(uri.path);
            var utail=upath === bpath ? "" : upath.startsWith(bhead) ? upath.substring(bhead.length) : upath;

            return uri.scheme !== this.scheme ? uri : new this.constructor({
                authority: uri.authority !== this.authority ? uri.authority : "",
                path: utail,
                query: uri.query !== this.query ? uri.query : "",
                fragment: uri.fragment
            });

        } else {
            return this.relativize(new this.constructor(uri));
        }
    },


    toString: function () {
        return this.specs;
    }

});


function parse(specs) { // see <http://tools.ietf.org/html/rfc3986#appendix-B>

    var match=specs.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);

    if (!match) {
        throw new URIError("malformed URI ["+specs+"]");
    }

    return {

        scheme: match[1],
        authority: match[3],
        path: match[5],
        query: match[6],
        fragment: match[8]

    };
}

function clean(path) {
    return path.split("/").reduce(function (value, item, index, array) {

        if (item === "..") {
            value.pop();
            if (value.length === 0 || index === array.length-1) { value.push(""); }
        } else if (item !== ".") {
            value.push(item);
        } else if (index === array.length-1) {
            value.push("");
        }

        return value;

    }, []).join("/");
}
