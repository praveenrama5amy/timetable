import { Children, Key, ReactNode } from "react";

interface Props {
    children: ReactNode;
    color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "link";
    onClick: () => void
}
interface SplitButtonProps {
    children: ReactNode;
    color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "link";
    onClick?: () => void;
    text: String
}

const Button = ({ children, color = "primary", onClick }: Props) => {
    return (
        <button className={"btn btn-" + color} onClick={onClick}>{children}</button>
    )
}


const SplitButton = ({ children, color = "secondary", onClick, text }: SplitButtonProps) => {
    return (
        <div className="btn-group">
            <button type="button" className={"btn btn-" + color} onClick={onClick}>{text}</button>
            <button type="button" className={"btn dropdown-toggle dropdown-toggle-split btn-" + color} data-bs-toggle="dropdown" aria-expanded="false">
                <span className="visually-hidden">Toggle Dropdown</span>
            </button>
            <ul className="dropdown-menu">
                {children}
            </ul>
        </div>
    )
}

export default Button
export { SplitButton }