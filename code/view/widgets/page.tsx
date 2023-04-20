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

import React, { createElement, ReactNode, useEffect, useState } from "react";
import "./page.css";


export type ToolPane={

    header?: ReactNode
    footer?: ReactNode

    children?: ReactNode

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ToolPage({

    side,
    tray,

    children

}: {

    side?: ReactNode
    tray?: ReactNode

    children: ReactNode

}) {


    const [expanded, setExpanded]=useState<boolean>();

    useEffect(() => {

        const resize=() => setExpanded(undefined);

        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);

    });


    return createElement("tool-page", {

        // onClick: e => {
        //
        //     if ( tray ) { setTray(!(e.target === e.currentTarget || (e.target as Element).closest("a"))); }
        //
        // },

        // onKeyDown: (e) => {
        //     if ( e && e.key === "Enter" ) {
        //         e.cancelable=true;
        //         if ( e.stopPropagation ) {
        //             e.stopPropagation();
        //             e.preventDefault();
        //         }
        //     }
        // }

    }, <>

        <nav>{side}</nav>
        <aside>{tray}</aside>
        <main>{children}</main>

    </>);
}
