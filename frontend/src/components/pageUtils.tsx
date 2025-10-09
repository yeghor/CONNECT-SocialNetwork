import React, { ReactNode} from "react";
import "../index.css"

import NavigationBar from "./base/navBar.tsx";
import FooterBar from "./base/footer.tsx";

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