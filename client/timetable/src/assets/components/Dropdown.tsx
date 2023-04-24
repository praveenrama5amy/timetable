import { BaseSyntheticEvent, Key, ReactNode } from "react";
import { v4 } from 'uuid';

interface props {
    text: string;
    color?: "primary" | "secondary" | "success" | "danger" | "warning" | "info"
    children?: ReactNode
    list: Array<{ name: string, value: string, disabled?: boolean }>
    separtatedList?: Array<{ name: string, value: string, disabled?: boolean }>
    onChange: (value: String) => void;
}

const Dropdown = ({ text, color = "primary", children, list, separtatedList, onChange }: props) => {
    function handleSelect(e: BaseSyntheticEvent) {
        onChange(e.target.id)
    }
    return (
        <div className="btn-group">
            <button type="button" className={"btn dropdown-toggle btn-" + color} data-bs-toggle="dropdown" aria-expanded="false">
                {text}
            </button>
            <ul className="dropdown-menu">
                {list.map(item => <li key={v4()}><a className={`dropdown-item ${item.disabled == true && "disabled"}`} href="#" onClick={handleSelect} id={item.value}>{item.name}</a></li>)}
                {separtatedList && separtatedList.length > 0 && <li><hr className="dropdown-divider" /></li>}
                {separtatedList?.map(item => {
                    return <li key={v4()}><a className={`dropdown-item ${item.disabled == true && "disabled"}`} href="#" onClick={handleSelect}>{item.name}</a></li>
                })}
            </ul>
        </div>
    )
}

export default Dropdown