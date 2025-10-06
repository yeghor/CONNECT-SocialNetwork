import React, { ReactNode} from "react";
import "../index.css"

import NavigationBar from "./base/navBar";
import FooterBar from "./base/footer";

interface ComponentProps {
    children: ReactNode
};  

const BaseComponentsWrapper = (props: ComponentProps) => {
    
    return (
        <div>
            <NavigationBar />
            {props.children}
            <FooterBar />
        </div>
    );
}

export default BaseComponentsWrapper;