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

import {resolve} from "path";
import postcssNesting from "postcss-nesting";
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import pkg from "../package.json"

const src = resolve("src");
const out = resolve("../docs/demo");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default defineConfig(({command, mode}) => ({ // https://vitejs.dev/config/

    root: src,
    base: "./",

    plugins: [react()],

    css: {
        postcss: {
            plugins: [postcssNesting()]
        }
    },

    define: {
        NAME: JSON.stringify(pkg.name),
        VERSION: JSON.stringify(pkg.version),
        DESCRIPTION: JSON.stringify(pkg.description),
    },

    build: {

        outDir: out,
        assetsDir: ".",
        emptyOutDir: true,

        rollupOptions: {
            output: {manualChunks: undefined} // no vendor chunks
        }

    },

    resolve: {
        alias: [
            {find: /^@metreeca\/demo\/(.*)$/, replacement: resolve(src, "$1")},
            {find: /^@metreeca\/(.*)$/, replacement: resolve("../code/$1")}
        ]
    }

}));
