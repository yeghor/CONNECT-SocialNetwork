import React, { useState } from "react";

interface SecondFactorProps {
    emailToConfirm: string
}

const SecondFactor = (props: SecondFactorProps) => {
    const [ confirmationCode, setConfirmationCode ] = useState("");
    const [ activeInput, setActiveInput ] = useState(0);

    

    return(
        <div>
            Hello World!
        </div>
    )
};

export default SecondFactor