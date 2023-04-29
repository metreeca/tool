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

"use strict";

const fs = require("fs");
const path = require("path");
const {globSync} = require("glob");
const dedent = require("dedent");

const md = "package.md";
const json = "package.json";
const readme = "README.md";
const license = "LICENSE";

const code = path.resolve("code");
const dist = path.resolve("dist");

const shared = JSON.parse(fs.readFileSync(path.resolve(json)));


// copy readme

fs.copyFileSync(path.resolve(readme), path.resolve(dist, readme));

// copy license

fs.copyFileSync(path.resolve(license), path.resolve(dist, license));


// create publishing root package

fs.writeFileSync(path.resolve(dist, json), JSON.stringify({

    ...publishing(shared),

    workspaces: ["*"]

}, null, 4));


// create publishing packages

fs.readdirSync(code).filter(file => !file.startsWith("#") && fs.existsSync(path.resolve(code, file, json))).forEach(module => {

    const source = path.resolve(code, module);
    const target = path.resolve(dist, module);

    const local = JSON.parse(fs.readFileSync(path.resolve(source, json)));


    // create readme

    fs.writeFileSync(path.resolve(target, readme), dedent`
    
        [![npm](https://img.shields.io/npm/v/${local.name})](https://www.npmjs.com/package/${local.name})
    
        # ${local.name}
        
        [Metreeca/Tool](https://github.com/metreeca/tool) ${lower(local.description)}.
                        
        ${fs.readFileSync(path.resolve(source, md))}
        
        # Support
        
        - open an [issue](https://github.com/metreeca/tool/issues) to report a problem or to suggest a new feature
        - start a [discussion](https://github.com/metreeca/tool/discussions) to ask a how-to question or to share an idea
        
        # License
        
        This project is licensed under the Apache 2.0 License – see
        [LICENSE](https://github.com/metreeca/tool/blob/main/LICENSE) file for details.
    
    `);


    // copy license

    fs.copyFileSync(license, path.resolve(target, license));


    // create package.json

    fs.writeFileSync(path.resolve(target, json), JSON.stringify(publishing(local), null, 4));


    // copy stylesheets

    globSync(`${source}/**/*.css`).forEach(css => {

        const dst = path.resolve(target, path.relative(source, css));

        fs.mkdirSync(path.dirname(dst), {recursive: true});
        fs.copyFileSync(css, dst);

    });

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function publishing(local) {
    return {

        name: local.name,
        version: shared.version,
        description: local.name === "@metreeca/tool" ? local.description : `Metreeca/Tool ${lower(local.description)}`,

        keywords: local.keywords,
        homepage: shared.homepage,
        repository: shared.repository,
        bugs: shared.bugs,
        license: shared.license,
        author: shared.author,

        dependencies: local.dependencies === undefined ? undefined : Object
            .entries(local.dependencies)
            .reduce((deps, [pkg, ver]) => ({...deps, [pkg]: ver || shared.version}), {}),

        peerDependencies: local.peerDependencies

    };
}

function lower(string) {
    return string.replace(/^\w(?![A-Z])/, c => c.toLowerCase());
}
