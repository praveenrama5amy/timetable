import { BaseSyntheticEvent } from "react";

interface Props {
    selected?: string;
    options: string[];
    onChange: (e: BaseSyntheticEvent) => void;
}

const Select = ({ selected, options, onChange }: Props) => {
    return (
        <select className="form-select" style={{ width: "200px" }} aria-label="Default select example" defaultValue={selected} onChange={onChange}>
            {options.map((item, index) =>
                <option value={item} key={item}>{item}</option>
            )}
        </select>
    )
}

export default Select
