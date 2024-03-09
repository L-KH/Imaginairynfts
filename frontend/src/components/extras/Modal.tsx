'use client'
import React, {ReactNode} from 'react';

interface IModal {
    id: string,
    children: ReactNode,
    className?: string,
    setOpen: (e: boolean) => void,
    open: boolean
}

const Modal = ({id, children, className, open, setOpen}: IModal) => {
    return (
        <>
            {/* <label
                htmlFor={id}
                className={className}>
                {children[0]}
            </label> */}

           
            <input type="checkbox" id={id} className="modal-toggle" checked={open} readOnly/>

            <div className="modal">
                <div className="modal-box rounded-none max-h-none bg-transparent">
                    {children}
                </div>
                <label className="modal-backdrop" htmlFor={id} onClick={() => setOpen(false)}>Close</label>
            </div>
        </>
    );
};

export default Modal;